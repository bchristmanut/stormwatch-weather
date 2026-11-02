/* Forecast transparency: Open-Meteo best match vs NOAA GFS model.
   A difference between models is not a calibrated probability or accuracy score. */
(()=>{'use strict';
const daily=document.getElementById('dailyPanel');if(!daily)return;
const section=document.createElement('section');section.className='sw-confidence';section.setAttribute('aria-label','Forecast confidence and model comparison');
const title=document.createElement('h3');title.textContent='Forecast Confidence';
const status=document.createElement('p');status.className='sw-confidence-status';status.textContent='Loading forecast comparison…';
const grid=document.createElement('div');grid.className='sw-confidence-grid';
const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='How to interpret this comparison';
const explanation=document.createElement('p');explanation.textContent='StormWatch compares Open-Meteo’s automatically selected forecast with the NOAA GFS forecast. A smaller difference means these two forecasts agree more closely, not that either is guaranteed correct. Forecast uncertainty generally increases with lead time. This is not an official forecast-confidence rating.';
detail.append(summary,explanation);section.append(title,status,grid,detail);daily.prepend(section);
let active=0,controller=null;
function tile(label,value){const item=document.createElement('div');item.className='sw-confidence-tile';const a=document.createElement('small'),b=document.createElement('strong');a.textContent=label;b.textContent=value;item.append(a,b);return item}
function number(x){return typeof x==='number'&&Number.isFinite(x)?x:null}
function dateName(s){return new Date(s+'T12:00:00').toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'})}
window.addEventListener('stormwatch:updated',async e=>{
 const token=++active;if(controller)controller.abort();controller=new AbortController();
 const location=e.detail.location,base=e.detail.weather;
 grid.replaceChildren();status.textContent='Comparing forecast models…';
 if(!base?.daily?.time?.length)return;
 const params=new URLSearchParams({latitude:String(location.lat),longitude:String(location.lon),timezone:'auto',temperature_unit:'fahrenheit',precipitation_unit:'inch',models:'gfs_seamless',forecast_days:'7',daily:'temperature_2m_max,temperature_2m_min,precipitation_sum'});
 const timer=setTimeout(()=>controller.abort(),11000);
 try{
 const response=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:controller.signal,cache:'no-store'});
 if(!response.ok)throw Error('Comparison service unavailable');
 const data=await response.json();if(data.error||!data.daily?.time?.length)throw Error('Comparison data unavailable');
 if(token!==active)return;
 const index=new Map(data.daily.time.map((t,i)=>[t,i]));
 const rows=base.daily.time.slice(0,7).map((day,i)=>{const j=index.get(day);if(j===undefined)return null;const primary=number(base.daily.temperature_2m_max[i]),alternate=number(data.daily.temperature_2m_max[j]),rainA=number(base.daily.precipitation_sum[i]),rainB=number(data.daily.precipitation_sum[j]);return {day,primary,alternate,rainA,rainB,diff:primary===null||alternate===null?null:Math.abs(primary-alternate)}}).filter(Boolean);
 if(!rows.length)throw Error('No matching forecast days');
 const first=rows[0],valid=rows.filter(r=>r.diff!==null),avg=valid.length?valid.reduce((s,r)=>s+r.diff,0)/valid.length:null;const wet=rows.filter(r=>r.rainA!==null&&r.rainB!==null),rainDiff=wet.length?wet.reduce((s,r)=>s+Math.abs(r.rainA-r.rainB),0)/wet.length:null;
 grid.append(tile('Today: high temperature difference',first.diff===null?'Unavailable':first.diff.toFixed(1)+'°F'),tile('7-day average high difference',avg===null?'Unavailable':avg.toFixed(1)+'°F'),tile('Average daily rain total difference',rainDiff===null?'Unavailable':rainDiff.toFixed(2)+' in'));
 const table=document.createElement('table');table.className='sw-confidence-table';
 const head=document.createElement('thead'),tr=document.createElement('tr');for(const name of ['Day','Main high','GFS high','Difference','Main rain','GFS rain']){const th=document.createElement('th');th.textContent=name;tr.append(th)}head.append(tr);table.append(head);
 const body=document.createElement('tbody');for(const row of rows){const tr=document.createElement('tr');for(const value of [dateName(row.day),row.primary===null?'—':Math.round(row.primary)+'°',row.alternate===null?'—':Math.round(row.alternate)+'°',row.diff===null?'—':row.diff.toFixed(1)+'°',row.rainA===null?'—':row.rainA.toFixed(2)+' in',row.rainB===null?'—':row.rainB.toFixed(2)+' in']){const td=document.createElement('td');td.textContent=value;tr.append(td)}body.append(tr)}table.append(body);section.insertBefore(table,detail);
 for(const old of section.querySelectorAll('table:not(:last-child)')){if(old!==table)old.remove()}
 status.textContent='Two model views · Main: Open-Meteo best match · Comparison: NOAA GFS · Retrieved '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'.';
 }catch(err){if(token!==active)return;status.textContent='Model comparison currently unavailable. The main forecast remains available.';grid.replaceChildren(tile('Main forecast','Available'));for(const table of section.querySelectorAll('table'))table.remove()}
 finally{clearTimeout(timer)}
});
})();