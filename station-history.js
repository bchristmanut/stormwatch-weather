/* StormWatch v37: experimental station-observation verification for completed dates. */
(()=>{'use strict';
const journal=document.querySelector('.su32');if(!journal)return;
const section=document.createElement('section');section.className='su37';
section.innerHTML='<h3>Station history cross-check</h3><p class="su37-status" role="status">Load a US location to check station history.</p><button type="button" class="su37-button">Compare recent completed days</button><div class="su37-results"></div><p class="su37-note">Experimental: compares saved next-day forecast highs with available NWS station readings. A station daily maximum derived from periodic reports can miss the actual peak. Only dates with broad observation coverage are shown. This does not replace the historical gridded verification journal.</p>';
journal.after(section);
const status=section.querySelector('.su37-status'),results=section.querySelector('.su37-results'),button=section.querySelector('button'),key='stormwatch-verification-v32';
let loc=null,tz='America/Chicago',busy=false,seq=0;
const num=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
function read(){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function id(l){return l.lat.toFixed(2)+','+l.lon.toFixed(2)}
function us(a,b){return(a>=24&&a<=50&&b>=-125&&b<=-66)||(a>=51&&a<=72&&b>=-170&&b<=-129)||(a>=18&&a<=23&&b>=-161&&b<=-154)}
function dist(a,b,c,d){const r=Math.PI/180,z=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 3958.8*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z))}
async function get(url){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),11000);try{const r=await fetch(url,{signal:ctl.signal,headers:{Accept:'application/geo+json'}});if(!r.ok)throw Error('NWS HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}}
function localDay(time){const parts=new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(time));const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return v.year+'-'+v.month+'-'+v.day}
window.addEventListener('stormwatch:updated',e=>{const l=e.detail?.location,w=e.detail?.weather;if(!Number.isFinite(l?.lat)||!Number.isFinite(l?.lon))return;loc={lat:l.lat,lon:l.lon};tz=w?.timezone||'America/Chicago';seq++;results.replaceChildren();status.textContent=us(l.lat,l.lon)?'Ready to check recent station observations.':'Station history is available only for supported US locations.'});
button.addEventListener('click',async()=>{if(busy||!loc)return;if(!us(loc.lat,loc.lon)){status.textContent='Unsupported location for NWS station history.';return}
const token=seq;busy=true;button.disabled=true;results.replaceChildren();status.textContent='Looking for recent completed forecasts and nearby station reports…';
try{const now=Date.now(),cutoff=localDay(now-86400000),minDay=localDay(now-6*86400000),records=read().filter(x=>x.loc===id(loc)&&x.date>=minDay&&x.date<cutoff&&num(x.predictedHigh)!==null).sort((a,b)=>a.date.localeCompare(b.date));if(!records.length){status.textContent='No eligible saved forecasts from recent completed days yet. Keep using StormWatch.';return}
const point=await get('https://api.weather.gov/points/'+loc.lat.toFixed(4)+','+loc.lon.toFixed(4));if(token!==seq)return;
const url=point.properties?.observationStations;if(typeof url!=='string'||!url.startsWith('https://api.weather.gov/'))throw Error('Station list unavailable');
const directory=await get(url);if(token!==seq)return;
const stations=(directory.features||[]).map(f=>{const c=f.geometry?.coordinates;return{url:f.id,name:f.properties?.name||'NWS station',miles:Array.isArray(c)?dist(loc.lat,loc.lon,c[1],c[0]):Infinity}}).filter(s=>s.url?.startsWith('https://api.weather.gov/stations/')&&s.miles<=40).sort((a,b)=>a.miles-b.miles).slice(0,3);
let chosen=null,byDay=null;for(const station of stations){try{const params=new URLSearchParams({start:new Date(now-7*86400000).toISOString(),end:new Date(now-86400000).toISOString(),limit:'500'});const data=await get(station.url+'/observations?'+params);if(token!==seq)return;
const buckets=new Map();for(const f of data.features||[]){const p=f.properties||{},temp=num(p.temperature?.value),t=Date.parse(p.timestamp||'');if(temp===null||!Number.isFinite(t))continue;const day=localDay(t),arr=buckets.get(day)||[];arr.push({temp:temp*9/5+32,time:t});buckets.set(day,arr)}
const eligible=new Map();for(const [day,arr] of buckets){const hours=new Set(arr.map(x=>Number(new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'numeric',hourCycle:'h23'}).format(new Date(x.time)))));if(arr.length>=12&&hours.size>=12&&Math.min(...hours)<=3&&Math.max(...hours)>=20)eligible.set(day,Math.max(...arr.map(x=>x.temp)))}
if(eligible.size){chosen=station;byDay=eligible;break}}catch{}}
if(!chosen)throw Error('No nearby station has enough recent hourly coverage');
const comparisons=records.filter(x=>byDay.has(x.date));if(!comparisons.length){status.textContent='Station data loaded, but there are no sufficiently covered dates matching saved forecasts.';return}
const title=document.createElement('p');title.textContent=chosen.name+' · '+chosen.miles.toFixed(1)+' mi away';results.append(title);
for(const x of comparisons){const high=byDay.get(x.date),error=x.predictedHigh-high,row=document.createElement('div');row.className='su37-row';row.textContent=x.date+' · Forecast '+x.predictedHigh.toFixed(1)+'°F · Station max '+high.toFixed(1)+'°F · Difference '+(error>=0?'+':'')+error.toFixed(1)+'°F';results.append(row)}
const mae=comparisons.reduce((sum,x)=>sum+Math.abs(x.predictedHigh-byDay.get(x.date)),0)/comparisons.length;status.textContent=comparisons.length+' matched day(s) · Mean absolute difference '+mae.toFixed(1)+'°F. Station peaks may be underestimated.';
}catch(err){if(token===seq)status.textContent='Station history unavailable: '+(err?.message||'Network error')+'. Try again later.'}finally{busy=false;button.disabled=false}});
})();