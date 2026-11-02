/* StormWatch interactive extras: radar inspector, dashboard, sun, watchlist and scenes */
(()=>{'use strict';
const $=id=>document.getElementById(id),store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
let latest=null,location=null;
window.addEventListener('stormwatch:updated',e=>{latest=e.detail.weather;location=e.detail.location});
function create(parent,title){if(!parent)return null;const box=document.createElement('section');box.className='sw-extra';const h=document.createElement('h3');h.textContent=title;box.append(h);parent.prepend(box);return box}
function node(tag,text,parent,cls){const n=document.createElement(tag);if(text!==null)n.textContent=text;if(cls)n.className=cls;if(parent)parent.append(n);return n}
function button(text,parent,fn){const b=node('button',text,parent);b.type='button';b.addEventListener('click',fn);return b}
function format(v,unit=''){return typeof v==='number'&&Number.isFinite(v)?Math.round(v)+unit:'—'}
function hour(s){return s?.slice(11,16)||'—'}
function forecast(){const h=latest?.hourly;if(!h)return [];const start=Math.max(0,h.time.findIndex(t=>t>=latest.current.time.slice(0,13)));return h.time.slice(start,start+48).map((time,j)=>{const i=start+j;return {time,temp:h.temperature_2m?.[i],rain:h.precipitation_probability?.[i],wind:h.wind_speed_10m?.[i],precip:h.precipitation?.[i]}})}
// 2: radar crosshair / location inspector. RainViewer raster has no numerical intensity API.
const radar=create($('radarPanel'),'◎ Radar Location Inspector');
if(radar){node('p','Tap the map to inspect a location. This shows forecast values at the selected coordinates, not a measured radar-pixel intensity.',radar);
const info=node('div','Tap anywhere on the radar map to begin.',radar,'sw-readout');let marker=null,request=0;
const center=button('Inspect my saved city',radar,()=>{if(location)inspect(location.lat,location.lon)});
async function inspect(lat,lon){const token=++request;info.textContent='Looking up weather at '+lat.toFixed(3)+', '+lon.toFixed(3)+'…';if(typeof sw3Map!=='undefined'&&sw3Map&&window.L){if(marker)sw3Map.removeLayer(marker);marker=L.circleMarker([lat,lon],{radius:8,color:'#b9efff',fillColor:'#0d629c',fillOpacity:.9}).addTo(sw3Map)}
try{const p=new URLSearchParams({latitude:lat,longitude:lon,current:'temperature_2m,precipitation,weather_code',hourly:'precipitation_probability',forecast_days:'1',timezone:'auto',temperature_unit:'fahrenheit',precipitation_unit:'inch'});const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000);let response;try{response=await fetch('https://api.open-meteo.com/v1/forecast?'+p,{signal:ctrl.signal})}finally{clearTimeout(timer)}if(!response.ok)throw Error();const d=await response.json();if(token!==request)return;info.textContent='Coordinates: '+lat.toFixed(3)+', '+lon.toFixed(3)+' · Temperature: '+format(d.current?.temperature_2m,'°F')+' · Current precipitation: '+(d.current?.precipitation??'—')+' in · Forecast rain chance: '+format(d.hourly?.precipitation_probability?.[0],'%')+'. Forecast model values; radar imagery is historical.'}catch{if(token===request)info.textContent='Could not retrieve forecast for this point. Radar imagery is still available.'}}
function bind(){if(typeof sw3Map!=='undefined'&&sw3Map&&!sw3Map._swInspectBound){sw3Map._swInspectBound=true;sw3Map.on('click',e=>inspect(e.latlng.lat,e.latlng.lng))}}
window.addEventListener('stormwatch:updated',bind);window.addEventListener('stormwatch:radarready',bind);setTimeout(bind,1000)}
// 3: dashboard customization: show/hide and reorder panels, stored per device.
const home=$('forecastSection'),dashboard=create(home?.parentElement,'⚙ Customize Dashboard');
if(dashboard){node('p','Show, hide, or move Home weather cards. Preferences are saved on this device.',dashboard);
const entries=[['conditionsSummary','Conditions'],['hourlyPanel','Hourly forecast'],['rainPanel','Rain Intelligence']];
const key='sw-dashboard-v1';let settings=read(key,entries.map(x=>({id:x[0],visible:true})));if(!Array.isArray(settings))settings=[];
settings=entries.map(([id])=>settings.find(x=>x.id===id)||{id,visible:true});
const list=node('div',null,dashboard);
function apply(){for(const s of settings){const e=$(s.id);if(e)e.style.display=s.visible?'':'none'}store(key,settings)}
function draw(){list.replaceChildren();settings.forEach((s,i)=>{const row=node('div',null,list,'sw-dashboard-row'),name=entries.find(x=>x[0]===s.id)?.[1]||s.id;const check=node('input',null,row);check.type='checkbox';check.checked=s.visible;check.setAttribute('aria-label','Show '+name);check.addEventListener('change',()=>{s.visible=check.checked;apply()});node('span',name,row);button('↑',row,()=>{if(i){[settings[i-1],settings[i]]=[settings[i],settings[i-1]];reorder();draw()}}).disabled=i===0;button('↓',row,()=>{if(i<settings.length-1){[settings[i+1],settings[i]]=[settings[i],settings[i+1]];reorder();draw()}}).disabled=i===settings.length-1})}
function reorder(){const main=home.parentElement;let anchor=home;for(const s of settings){const e=$(s.id);if(e){anchor.after(e);anchor=e}}apply()}
reorder();draw();dashboard.style.display='none';
const toggle=button('⚙ Customize Home',home,()=>{dashboard.style.display=dashboard.style.display==='none'?'':'none'});toggle.className='sw-dashboard-toggle'}
// 4: interactive sun track based on daily sunrise/sunset timestamps
const sun=create($('sunPanel'),'☀ Interactive Daylight Explorer');
if(sun){node('p','Move the slider to explore daylight progress. This is a time-of-day illustration, not a calculated solar azimuth or elevation.',sun);
const range=node('input',null,sun);range.type='range';range.min='0';range.max='1440';range.step='10';range.value='720';range.setAttribute('aria-label','Time of day');const info=node('div','Waiting for sunrise and sunset…',sun,'sw-readout');
function update(){const a=latest?.daily?.sunrise?.[0],b=latest?.daily?.sunset?.[0];if(!a||!b)return;const minutes=s=>Number(s.slice(11,13))*60+Number(s.slice(14,16));const rise=minutes(a),set=minutes(b),t=Number(range.value),p=Math.max(0,Math.min(100,(t-rise)/(set-rise)*100)),clock=((Math.floor(t/60)+11)%12+1)+':'+String(t%60).padStart(2,'0')+(t>=720?' PM':' AM');info.textContent=clock+' · '+(t<rise?'Before sunrise':t>set?'After sunset':'Daylight '+Math.round(p)+'% complete')+' · Sunrise '+hour(a)+' · Sunset '+hour(b)+' · Daylight '+Math.round((set-rise)/60*10)/10+' hours'}
range.addEventListener('input',update);window.addEventListener('stormwatch:updated',update)}
// 5: forecast-based personal thresholds (not background notifications)
const alerts=create($('alertPanel'),'☆ Personal Weather Watchlist');
if(alerts){node('p','Choose forecast thresholds. StormWatch highlights matching conditions while open; these are not emergency notifications.',alerts);
const settings=read('sw-watchlist-v1',{rain:70,wind:30,heat:95,cold:32});const fields=[['rain','Rain chance','%'],['wind','Wind speed',' mph'],['heat','High temperature','°F'],['cold','Low temperature','°F']];
for(const [key,label,unit] of fields){const wrap=node('label',null,alerts),text=node('span',label+' ≥ '+settings[key]+unit,wrap),input=node('input',null,wrap);input.type='range';input.min=key==='wind'?10:key==='cold'?-20:key==='heat'?70:10;input.max=key==='wind'?80:key==='cold'?60:key==='heat'?120:100;input.step=key==='rain'?5:1;input.value=settings[key];input.setAttribute('aria-label',label+' threshold');input.addEventListener('input',()=>{settings[key]=Number(input.value);text.textContent=label+(key==='cold'?' ≤ ':' ≥ ')+settings[key]+unit;store('sw-watchlist-v1',settings);evaluate()});if(key==='cold')text.textContent=label+' ≤ '+settings[key]+unit}
const results=node('div',null,alerts);
function evaluate(){results.replaceChildren();const days=forecast(),checks=[['Rain chance',days.filter(x=>x.rain>=settings.rain),x=>format(x.rain,'%')],['Wind',days.filter(x=>x.wind>=settings.wind),x=>format(x.wind,' mph')],['Heat',days.filter(x=>x.temp>=settings.heat),x=>format(x.temp,'°F')],['Cold',days.filter(x=>x.temp<=settings.cold),x=>format(x.temp,'°F')]];for(const [label,matches,fmt] of checks){const row=node('div',null,results,'sw-risk');node('strong',label+': '+(matches.length?'Threshold reached':'No match in next 48h'),row);node('small',matches.length?matches.length+' matching hour(s); first '+matches[0].time.slice(5,16).replace('T',' ')+' ('+fmt(matches[0])+')':'Forecast checked for next 48 hours',row)}}window.addEventListener('stormwatch:updated',evaluate)}
// 6: scene presets, with reduced-motion preference respected.
const scene=create($('detailsPanel'),'✦ Weather Scene Preferences');
if(scene){node('p','Choose how animated weather backgrounds behave. Reduced Motion accessibility settings always take precedence.',scene);
const row=node('div',null,scene,'sw-flex'),choices=[['auto','Automatic'],['still','Still background'],['subtle','Subtle motion']];let mode=read('sw-scene-v1','auto');
function apply(){document.body.classList.toggle('sw-scene-still',mode==='still');document.body.classList.toggle('sw-scene-subtle',mode==='subtle');for(const b of row.children)b.setAttribute('aria-pressed',String(b.dataset.mode===mode));store('sw-scene-v1',mode)}
for(const [id,label] of choices){const b=button(label,row,()=>{mode=id;apply()});b.dataset.mode=id}apply()}
})();