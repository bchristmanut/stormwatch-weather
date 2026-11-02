/* StormWatch Weather Agent v45: free, on-device rule-based forecast briefing. */
(()=>{'use strict';
const hero=document.getElementById('forecastSection');if(!hero)return;
const panel=document.createElement('section');panel.className='sw-agent panel';panel.id='weatherAgent';
const heading=document.createElement('h2');heading.textContent='⚡ StormWatch Weather Agent';
const status=document.createElement('p');status.className='sw-agent-status';status.setAttribute('role','status');status.textContent='Waiting for forecast…';
const briefing=document.createElement('div');briefing.className='sw-agent-briefing';
const actions=document.createElement('div');actions.className='sw-agent-actions';
const refresh=document.createElement('button');refresh.type='button';refresh.textContent='Refresh briefing';
const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent='How this agent works';const explanation=document.createElement('p');explanation.textContent='Free, on-device weather analysis using Open-Meteo forecasts and official NWS alerts for US locations. This is a rule-based weather assistant, not a generative AI model. Forecasts are uncertain; this app does not provide background emergency notifications.';detail.append(summary,explanation);
actions.append(refresh);panel.append(heading,status,briefing,actions,detail);hero.parentNode.insertBefore(panel,hero);
let latest=null,sequence=0;
const valid=x=>typeof x==='number'&&Number.isFinite(x);
const us=(lat,lon)=>lat>=24&&lat<=50&&lon>=-125&&lon<=-66||lat>=51&&lat<=72&&lon>=-170&&lon<=-129||lat>=18&&lat<=23&&lon>=-161&&lon<=-154;
const time=s=>{const h=Number(s.slice(11,13));return(h%12||12)+(h<12?' AM':' PM')};
function line(title,message){const item=document.createElement('p'),label=document.createElement('strong');label.textContent=title+' ';item.append(label,document.createTextNode(message));briefing.append(item)}
async function run(){
if(!latest)return;const token=++sequence,{weather:d,location:loc}=latest,h=d?.hourly,c=d?.current;
briefing.replaceChildren();status.textContent='Analyzing latest forecast…';
if(!Array.isArray(h?.time)||!h.time.length){status.textContent='No hourly forecast available.';return}
const now=c?.time||h.time[0],found=h.time.findIndex(x=>x.slice(0,13)>=now.slice(0,13)),start=found<0?0:found;
const rows=h.time.slice(start,start+12).map((t,i)=>({t,prob:h.precipitation_probability?.[start+i],amount:h.precipitation?.[start+i],temp:h.temperature_2m?.[start+i],wind:h.wind_speed_10m?.[start+i],code:h.weather_code?.[start+i]}));
const first=rows.find(x=>(valid(x.prob)&&x.prob>=40)||(valid(x.amount)&&x.amount>=0.01));
const peak=rows.reduce((a,x)=>valid(x.prob)&&(!a||x.prob>a.prob)?x:a,null);
const amounts=rows.filter(x=>valid(x.amount)),total=amounts.reduce((sum,x)=>sum+Math.max(0,x.amount),0);
if(first)line('Precipitation:', 'Possible around '+time(first.t)+'.'+(peak?' Highest hourly chance '+Math.round(peak.prob)+'% near '+time(peak.t)+'.':'')+(amounts.length===rows.length?' Forecast 12-hour total '+total.toFixed(2)+' in.':''));
else if(rows.some(x=>valid(x.prob)||valid(x.amount)))line('Precipitation:','No strong precipitation signal in the next 12 hours.');
else line('Precipitation:','Hourly rain information is unavailable.');
const firstTemp=rows[0]?.temp,lastTemp=rows.at(-1)?.temp;
if(valid(firstTemp)&&valid(lastTemp)){const change=Math.round(lastTemp-firstTemp);line('Temperature:',Math.abs(change)>=5?(change>0?'Warming':'Cooling')+' about '+Math.abs(change)+'°F over 12 hours.':'Relatively steady over the next 12 hours.')}
const windy=rows.filter(x=>valid(x.wind)).reduce((a,x)=>!a||x.wind>a.wind?x:a,null);
if(windy&&windy.wind>=25)line('Wind:','Forecast winds may reach '+Math.round(windy.wind)+' mph around '+time(windy.t)+'.');
if(rows.some(x=>[95,96,99].includes(x.code)))line('Storm potential:','Thunderstorms appear in the hourly forecast. Monitor official warnings.');
const fresh=typeof navigator!=='undefined'&&!navigator.onLine;
if(fresh){line('Alerts:','Offline. Official alert status cannot be checked.');status.textContent='Forecast briefing · offline data may be stale';return}
if(!valid(loc?.lat)||!valid(loc?.lon)||!us(loc.lat,loc.lon)){line('Alerts:','Official NWS alerts are available for US locations only.');status.textContent='Forecast briefing ready';return}
try{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);let response;try{response=await fetch('https://api.weather.gov/alerts/active?point='+loc.lat.toFixed(4)+','+loc.lon.toFixed(4),{headers:{Accept:'application/geo+json'},signal:controller.signal})}finally{clearTimeout(timeout)}
if(!response.ok)throw Error('Alert service unavailable');const data=await response.json();if(token!==sequence)return;
const alerts=Array.isArray(data.features)?data.features:[];
if(alerts.length){const names=alerts.slice(0,3).map(x=>x.properties?.event||'Weather alert');line('Official NWS alerts:',names.join('; ')+(alerts.length>3?' and '+(alerts.length-3)+' more.':'.')+' Open Alerts for full details.')}
else line('Official NWS alerts:','No active alerts returned for this location at the time checked.');
status.textContent='Forecast briefing ready · alerts checked now';
}catch{if(token!==sequence)return;line('Official NWS alerts:','Could not check right now. Open Alerts or weather.gov to verify.');status.textContent='Forecast briefing ready · alert status unavailable'}
}
refresh.addEventListener('click',run);
window.addEventListener('stormwatch:updated',e=>{latest=e.detail;run()});
})();