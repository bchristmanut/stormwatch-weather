/* v61: Display-unit preferences. Open-Meteo data remains imperial internally for compatibility. */
(()=>{'use strict';
const panel=document.querySelector('.sw60-settings');if(!panel)return;
const KEY='stormwatch-units-v61',defaults={temp:'F',wind:'mph',rain:'in'};
let prefs;try{prefs={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{prefs={...defaults}}
const choices=[['temp','Temperature',[['F','Fahrenheit (°F)'],['C','Celsius (°C)']]],['wind','Wind speed',[['mph','Miles per hour'],['kmh','Kilometers per hour']]],['rain','Precipitation',[['in','Inches'],['mm','Millimeters']]]];
const wrap=document.createElement('section');wrap.className='sw61-units';const heading=document.createElement('h3');heading.textContent='Measurement units';const hint=document.createElement('p');hint.textContent='Choose units for the main weather displays. Data sources and forecasts remain unchanged.';wrap.append(heading,hint);
let latest=null;
const valid=n=>typeof n==='number'&&Number.isFinite(n);
const temp=n=>valid(n)?Math.round(prefs.temp==='C'?(n-32)*5/9:n)+'°'+prefs.temp:'—';
const wind=n=>valid(n)?Math.round(prefs.wind==='kmh'?n*1.609344:n)+' '+prefs.wind:'—';
const rain=n=>valid(n)?(prefs.rain==='mm'?n*25.4:n).toFixed(prefs.rain==='mm'?1:2)+' '+prefs.rain:'—';
const put=(selector,value)=>{const node=document.querySelector(selector);if(node)node.textContent=value};
for(const [key,label,options] of choices){const row=document.createElement('label');row.className='sw60-option';row.append(document.createTextNode(label));const select=document.createElement('select');select.setAttribute('aria-label',label);for(const [value,title] of options){const option=document.createElement('option');option.value=value;option.textContent=title;select.append(option)}select.value=options.some(([v])=>v===prefs[key])?prefs[key]:defaults[key];prefs[key]=select.value;select.addEventListener('change',()=>{prefs[key]=select.value;try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}render()});row.append(select);wrap.append(row)}
panel.append(wrap);
function render(){if(!latest)return;const d=latest,h=d.hourly||{},day=d.daily||{},c=d.current||{};
put('#temp',valid(c.temperature_2m)?Math.round(prefs.temp==='C'?(c.temperature_2m-32)*5/9:c.temperature_2m):'—');
put('#range','H: '+temp(day.temperature_2m_max?.[0])+'  L: '+temp(day.temperature_2m_min?.[0]));
put('#feels',temp(c.apparent_temperature));put('#wind',wind(c.wind_speed_10m));put('#rain',rain(c.precipitation));
const start=Math.max(0,(h.time||[]).findIndex(t=>t>=(c.time||'').slice(0,13)));
document.querySelectorAll('#hourly .hour b').forEach((node,i)=>node.textContent=temp(h.temperature_2m?.[start+i]));
document.querySelectorAll('#daily .day').forEach((row,i)=>{const t=row.querySelector('.temps');if(t){t.textContent=temp(day.temperature_2m_max?.[i])+'  '+temp(day.temperature_2m_min?.[i])}});
const metrics={'Dew point':temp(c.dew_point_2m),'Wind gusts':wind(c.wind_gusts_10m),'Rain this interval':rain(c.rain),'Today precipitation':rain(day.precipitation_sum?.[0]),'Today maximum gust':wind(day.wind_gusts_10m_max?.[0])};
document.querySelectorAll('#advanced .weather-tile').forEach(tile=>{const label=tile.querySelector('span')?.textContent;if(Object.hasOwn(metrics,label)){const strong=tile.querySelector('strong');if(strong)strong.textContent=metrics[label]}});
put('.sw51-tile:nth-child(2) strong',wind(c.wind_speed_10m));
document.querySelectorAll('.sw57-detail-grid>div').forEach(tile=>{const label=tile.querySelector('span')?.textContent;const val=tile.querySelector('strong');if(!val)return;const index=window.sw61SelectedDay||0;const values={'High':temp(day.temperature_2m_max?.[index]),'Low':temp(day.temperature_2m_min?.[index]),'Rain total':rain(day.precipitation_sum?.[index]),'Wind peak':wind(day.wind_speed_10m_max?.[index])};if(Object.hasOwn(values,label))val.textContent=values[label]});
}
window.addEventListener('stormwatch:updated',e=>{latest=e.detail?.weather;queueMicrotask(render)});
window.addEventListener('stormwatch:forecast-day',e=>{window.sw61SelectedDay=e.detail.index;render()});
})();