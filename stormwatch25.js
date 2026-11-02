/* StormWatch v25: weather intelligence, dashboard controls, and iPhone enhancements. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const hero=$('forecastSection'),home=$('hourlyPanel'),rain=$('rainPanel');
if(!hero||!home||!rain)return;
const section=document.createElement('section');section.className='sw25 screen-home';section.setAttribute('aria-label','StormWatch weather intelligence');
section.innerHTML='<div class="sw25-heading"><div><small>STORMWATCH INTELLIGENCE</small><h2>Rain & forecast outlook</h2></div><span class="sw25-status">Forecast-based</span></div><div class="sw25-summary" role="status" aria-live="polite">Waiting for forecast data…</div><div class="sw25-bars" aria-label="Next 12 hours rain chance"></div><div class="sw25-key">Each bar is one forecast hour. Probability is not rainfall intensity.</div><div class="sw25-compare"><h3>Forecast confidence</h3><p>Forecasts can change. Compare upcoming conditions and check official alerts before making weather-sensitive plans.</p><div class="sw25-metrics"></div></div><details class="sw25-options"><summary>⚙ Home dashboard settings</summary><div class="sw25-toggles"></div><button type="button" class="sw25-reset">Restore default cards</button></details>';
hero.after(section);
const summary=section.querySelector('.sw25-summary'),bars=section.querySelector('.sw25-bars'),metrics=section.querySelector('.sw25-metrics');
const key='stormwatch-home-cards-v25',items=[['conditionsSummary','Current conditions'],['hourlyPanel','Hourly timeline'],['rainPanel','Rain Center'],['home-hub','Today in Focus']];
function read(){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function find(id){return id==='home-hub'?document.querySelector('.home-hub'):$(id)}
const toggles=section.querySelector('.sw25-toggles');
function apply(){const state=read();for(const [id] of items){const el=find(id);if(el)el.classList.toggle('sw25-hidden',state[id]===false)}}
function draw(){toggles.replaceChildren();const state=read();for(const [id,label] of items){const row=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=state[id]!==false;input.addEventListener('change',()=>{const s=read();s[id]=input.checked;try{localStorage.setItem(key,JSON.stringify(s))}catch{}apply()});row.append(input,document.createTextNode(label));toggles.append(row)}}
section.querySelector('.sw25-reset').addEventListener('click',()=>{try{localStorage.removeItem(key)}catch{}draw();apply()});draw();apply();
const format=(n,u='')=>typeof n==='number'&&Number.isFinite(n)?Math.round(n)+u:'—';
const card=(title,value)=>{const d=document.createElement('div');d.className='sw25-metric';const a=document.createElement('span'),b=document.createElement('strong');a.textContent=title;b.textContent=value;d.append(a,b);return d};
window.addEventListener('stormwatch:updated',event=>{
 const d=event.detail?.weather,h=d?.hourly;if(!h?.time?.length)return;
 const start=Math.max(0,h.time.findIndex(t=>t>=String(d.current?.time||h.time[0]).slice(0,13)));
 const hours=h.time.slice(start,start+12),rainChance=hours.map((_,j)=>h.precipitation_probability?.[start+j]),rainAmount=hours.map((_,j)=>h.precipitation?.[start+j]),temps=hours.map((_,j)=>h.temperature_2m?.[start+j]);
 const valid=a=>a.filter(n=>typeof n==='number'&&Number.isFinite(n));
 const chances=valid(rainChance),max=chances.length?Math.max(...chances):null;
 const first=rainChance.findIndex(n=>typeof n==='number'&&n>=40);
 const total=valid(rainAmount).reduce((a,b)=>a+b,0);
 summary.textContent=first>=0?'Rain chance reaches 40% or more around '+hours[first].slice(11,16)+' local. Peak hourly chance: '+format(max,'%')+'.':'No hour reaches a 40% rain chance in the next 12 hours. Peak: '+format(max,'%')+'.';
 bars.replaceChildren();for(let j=0;j<hours.length;j++){const col=document.createElement('div');col.className='sw25-hour';const bar=document.createElement('div');bar.className='sw25-bar';const fill=document.createElement('div');fill.className='sw25-fill';const n=rainChance[j];fill.style.height=(typeof n==='number'?Math.max(0,Math.min(100,n)):0)+'%';bar.append(fill);const time=document.createElement('small'),chance=document.createElement('strong');time.textContent=hours[j].slice(11,16);chance.textContent=format(n,'%');col.title=time.textContent+' · '+chance.textContent+' rain chance';col.append(bar,chance,time);bars.append(col)}
 metrics.replaceChildren(card('Next 12h rain total',total.toFixed(2)+' in'),card('Temperature range',valid(temps).length?format(Math.min(...valid(temps)),'°')+'–'+format(Math.max(...valid(temps)),'°'):'—'),card('Peak rain chance',format(max,'%')));
});
window.addEventListener('pageshow',apply);
})();
