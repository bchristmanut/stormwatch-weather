/* StormWatch v36: optional US weather station cross-check.
   A current-condition comparison is NOT a verified past forecast score. */
(()=>{'use strict';
const panel=document.getElementById('dailyPanel');if(!panel)return;
const root=document.createElement('section');root.className='su36';root.innerHTML='<h3>Live nearby station temperature</h3><p class="su36-status" role="status">Load a location to compare current temperatures.</p><button type="button" class="su36-check">Check NWS station</button><div class="su36-results"></div><details class="su36-note"><summary>About station readings</summary><p>Public NWS station reports may differ from your location due to distance, elevation and observation time. This compares current temperatures, not historical forecast skill.</p></details>';
const journal=document.querySelector('.su32');if(journal)journal.after(root);else panel.prepend(root);
const status=root.querySelector('.su36-status'),results=root.querySelector('.su36-results'),button=root.querySelector('.su36-check');
let loc=null,current=null,busy=false,token=0,lastKey='',lastAttempt=0;
const n=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
function us(lat,lon){return(lat>=24&&lat<=50&&lon>=-125&&lon<=-66)||(lat>=51&&lat<=72&&lon>=-170&&lon<=-129)||(lat>=18&&lat<=23&&lon>=-161&&lon<=-154)}
function haversine(a,b,c,d){const r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,z=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 3958.8*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z))}
function tile(k,v){const el=document.createElement('div'),name=document.createElement('span'),value=document.createElement('strong');name.textContent=k;value.textContent=v;el.append(name,value);results.append(el)}
async function get(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{const r=await fetch(url,{signal:controller.signal,headers:{Accept:'application/geo+json'}});if(!r.ok)throw Error('NWS returned HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}}
window.addEventListener('stormwatch:updated',e=>{const l=e.detail?.location,d=e.detail?.weather;if(!Number.isFinite(l?.lat)||!Number.isFinite(l?.lon))return;loc={lat:l.lat,lon:l.lon};current=n(d?.current?.temperature_2m);token++;results.replaceChildren();status.textContent=us(loc.lat,loc.lon)?'Looking for a nearby station reading…':'NWS station observations may not cover this location.';const key=loc.lat.toFixed(2)+','+loc.lon.toFixed(2);if(us(loc.lat,loc.lon)&&(key!==lastKey||Date.now()-lastAttempt>10*60000)){lastKey=key;lastAttempt=Date.now();queueMicrotask(()=>button.click())}});
button.addEventListener('click',async()=>{if(busy||!loc)return;if(!us(loc.lat,loc.lon)){status.textContent='NWS station lookup is available only in supported US regions.';return}
const seq=token;busy=true;button.disabled=true;results.replaceChildren();status.textContent='Finding nearby reporting stations…';
try{const point=await get('https://api.weather.gov/points/'+loc.lat.toFixed(4)+','+loc.lon.toFixed(4));if(seq!==token)return;
const stationUrl=point.properties?.observationStations;if(typeof stationUrl!=='string'||!stationUrl.startsWith('https://api.weather.gov/'))throw Error('No station directory returned');
const stations=await get(stationUrl);if(seq!==token)return;
const candidates=(stations.features||[]).map(f=>{const coords=f.geometry?.coordinates;return{url:f.id,name:f.properties?.name||f.properties?.stationIdentifier||'NWS station',distance:Array.isArray(coords)&&coords.length>=2?haversine(loc.lat,loc.lon,coords[1],coords[0]):Infinity}}).filter(x=>x.url?.startsWith('https://api.weather.gov/stations/')&&x.distance<=60).sort((a,b)=>a.distance-b.distance).slice(0,5);
let match=null;for(const station of candidates){try{const d=await get(station.url+'/observations/latest');if(seq!==token)return;const obs=d.properties,cel=n(obs?.temperature?.value),time=Date.parse(obs?.timestamp||'');if(cel===null||!Number.isFinite(time)||Date.now()-time>3*3600000||time>Date.now()+300000)continue;match={...station,temp:cel*9/5+32,time};break}catch{}}
if(!match)throw Error('No recent station temperature within 60 miles was available');
results.replaceChildren();tile('Station',match.name);tile('Distance',match.distance.toFixed(1)+' mi');tile('Station temperature',match.temp.toFixed(1)+'°F');tile('Report time',new Date(match.time).toLocaleString());if(current!==null)tile('Forecast current temperature',current.toFixed(1)+'°F');if(current!==null)tile('Temperature difference',(current-match.temp>=0?'+':'')+(current-match.temp).toFixed(1)+'°F');
status.textContent='Latest available station reading (not a forecast accuracy score).';
}catch(e){if(seq===token)status.textContent='No station reading right now: '+(e?.message||'Network or provider error')+'. Try again later.'}
finally{busy=false;button.disabled=false}});
})();
