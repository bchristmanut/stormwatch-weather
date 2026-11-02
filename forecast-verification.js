/* StormWatch v32: local forecast verification against Open-Meteo historical reanalysis.
   Historical gridded estimates are not station observations. */
(()=>{'use strict';
const panel=document.getElementById('dailyPanel');if(!panel)return;
const root=document.createElement('section');root.className='su32';root.innerHTML='<h3>Forecast verification journal</h3><p class="su32-status" role="status">Waiting for weather data…</p><div class="su32-stats"></div><button type="button" class="su32-check">Check completed forecasts</button><details><summary>What these scores mean</summary><p>StormWatch saves one forecast snapshot per location and day, then compares past predictions with Open-Meteo historical gridded weather estimates once dates have finished. Historical estimates are not ground-truth station measurements, and may be revised. Lower temperature and precipitation errors are better. Results are not calibrated probabilities or proof one model is best.</p></details><p class="su32-note">Saved only on this device, limited to 90 snapshots. Historical checks require an internet connection; allow several days for historical estimates to become available. Cached/offline forecasts are not recorded as new predictions.</p>';
panel.prepend(root);
const status=root.querySelector('.su32-status'),stats=root.querySelector('.su32-stats'),button=root.querySelector('.su32-check'),key='stormwatch-verification-v32';
let location=null,checking=false;
const num=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
function read(){try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function save(x){try{localStorage.setItem(key,JSON.stringify(x.slice(-90)))}catch{}window.dispatchEvent(new CustomEvent('stormwatch:verificationchanged'))}
function locationId(l){return Number(l.lat).toFixed(2)+','+Number(l.lon).toFixed(2)}
function show(){const items=read().filter(x=>location&&x.loc===locationId(location));const verified=items.filter(x=>x.observed&&num(x.predictedHigh)!==null&&num(x.observed.high)!==null);
const highErr=verified.length?verified.reduce((s,x)=>s+Math.abs(x.predictedHigh-x.observed.high),0)/verified.length:null;
const rain=items.filter(x=>x.observed&&num(x.predictedRain)!==null&&num(x.observed.rain)!==null);
const rainErr=rain.length?rain.reduce((s,x)=>s+Math.abs(x.predictedRain-x.observed.rain),0)/rain.length:null;
const rainBias=rain.length?rain.reduce((s,x)=>s+(x.predictedRain-x.observed.rain),0)/rain.length:null;
const rainHits=rain.length?rain.filter(x=>(x.predictedRain>=.01)===(x.observed.rain>=.01)).length:null;
const highBias=verified.length?verified.reduce((s,x)=>s+(x.predictedHigh-x.observed.high),0)/verified.length:null;
stats.replaceChildren();for(const [label,value] of [['Saved forecasts',String(items.length)],['Verified days',String(verified.length)],['Average high-temp error',highErr===null?'—':highErr.toFixed(1)+'°F'],['Average rain-total error',rainErr===null?'—':rainErr.toFixed(2)+' in'],['High-temp bias',highBias===null?'—':(highBias>=0?'+':'')+highBias.toFixed(1)+'°F'],['Rainfall bias',rainBias===null?'—':(rainBias>=0?'+':'')+rainBias.toFixed(2)+' in'],['Wet/dry day agreement',rainHits===null?'—':Math.round(100*rainHits/rain.length)+'% ('+rain.length+' days)']]){const div=document.createElement('div'),a=document.createElement('span'),b=document.createElement('strong');a.textContent=label;b.textContent=value;div.append(a,b);stats.append(div)}
status.textContent=verified.length?'Compared '+verified.length+' completed forecast day(s) with historical estimates.':'No verified days yet. Keep using StormWatch and check after forecast dates have passed.'}
window.addEventListener('stormwatch:updated',e=>{const d=e.detail?.weather,l=e.detail?.location;if(!d?.daily?.time||!l||!Number.isFinite(l.lat)||!Number.isFinite(l.lon))return;location={lat:l.lat,lon:l.lon};if(!(typeof stormCacheFallback!=='undefined'&&stormCacheFallback)){const list=read(),id=locationId(location),date=d.daily.time[1],high=num(d.daily.temperature_2m_max?.[1]),rain=num(d.daily.precipitation_sum?.[1]);if(date&&high!==null&&!list.some(x=>x.loc===id&&x.date===date)){list.push({loc:id,date,predictedHigh:high,predictedRain:rain,saved:Date.now()});save(list)}}show()});
button.addEventListener('click',async()=>{if(checking||!location)return;checking=true;button.disabled=true;status.textContent='Checking historical estimates…';
try{const id=locationId(location),all=read(),cutoff=new Date(Date.now()-4*86400000).toISOString().slice(0,10),pending=all.filter(x=>x.loc===id&&x.date<=cutoff&&!x.observed).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12);if(!pending.length){show();status.textContent='No eligible unverified days. Historical checks begin four days after the forecast date.';return}
const first=pending.map(x=>x.date).sort()[0],last=pending.map(x=>x.date).sort().at(-1);
const p=new URLSearchParams({latitude:String(location.lat),longitude:String(location.lon),start_date:first,end_date:last,daily:'temperature_2m_max,precipitation_sum',temperature_unit:'fahrenheit',precipitation_unit:'inch',timezone:'auto'});
const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);let response;try{response=await fetch('https://archive-api.open-meteo.com/v1/archive?'+p,{signal:controller.signal})}finally{clearTimeout(timer)}
if(!response.ok)throw Error('Historical data unavailable');const data=await response.json(),days=data.daily?.time;if(!Array.isArray(days))throw Error('No historical dates returned');
const map=new Map(days.map((date,i)=>[date,{high:num(data.daily.temperature_2m_max?.[i]),rain:num(data.daily.precipitation_sum?.[i])}]));
for(const x of pending){const observed=map.get(x.date);if(observed&&observed.high!==null&&observed.rain!==null)x.observed=observed}save(all);show()
}catch(err){status.textContent='Historical check unavailable: '+(err?.message||'Try again later')+'. Saved forecasts remain on this device.'}finally{checking=false;button.disabled=false}});
})();
