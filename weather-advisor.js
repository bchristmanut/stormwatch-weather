/* StormWatch Ultimate — Stage 1: local, rules-based Weather Advisor. */
(()=>{'use strict';
const hero=document.getElementById('forecastSection');if(!hero)return;
const panel=document.createElement('section');panel.className='sw-advisor screen-home';panel.setAttribute('aria-label','Weather Advisor');
panel.innerHTML='<div class="sw-advisor-head"><div><small>✦ STORMWATCH ULTIMATE</small><h2>Weather Advisor</h2></div><span class="sw-advisor-badge">Forecast guidance</span></div><p class="sw-advisor-lead" aria-live="polite">Preparing your personalized weather outlook…</p><div class="sw-advisor-grid"><div><span>Best time outdoors</span><strong data-advisor="window">—</strong></div><div><span>Rain outlook</span><strong data-advisor="rain">—</strong></div><div><span>Wind outlook</span><strong data-advisor="wind">—</strong></div><div><span>Temperature</span><strong data-advisor="temp">—</strong></div></div><details class="sw-advisor-detail"><summary>How was this recommendation made?</summary><p>Recommendations are calculated on your device from Open-Meteo hourly forecasts for the next 12 hours. They consider precipitation probability, temperature and wind, not real-time observations. No AI service, tracking, or paid API is used.</p><p>Check official NWS alerts for hazardous conditions. This advisor is not an emergency warning system.</p></details>';
hero.after(panel);
const set=(k,v)=>{const el=panel.querySelector('[data-advisor="'+k+'"]');if(el)el.textContent=v};
const number=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
const round=(x,u)=>number(x)===null?'—':Math.round(x)+u;
const clock=s=>{const h=Number(String(s).slice(11,13));return Number.isFinite(h)?((h+11)%12+1)+(h>=12?' PM':' AM'):'—'};
window.addEventListener('stormwatch:updated',event=>{
 const d=event.detail?.weather,h=d?.hourly;if(!h?.time?.length)return;
 const start=Math.max(0,h.time.findIndex(t=>t>=String(d.current?.time||h.time[0]).slice(0,13)));
 const rows=h.time.slice(start,start+12).map((time,j)=>{const i=start+j;return {time,rain:number(h.precipitation_probability?.[i]),temp:number(h.temperature_2m?.[i]),wind:number(h.wind_speed_10m?.[i])}});
 if(!rows.length)return;
 const values=(key)=>rows.map(r=>r[key]).filter(v=>v!==null);
 const rains=values('rain'),temps=values('temp'),winds=values('wind');
 const maxRain=rains.length?Math.max(...rains):null,maxWind=winds.length?Math.max(...winds):null;
 const wet=rows.find(r=>r.rain!==null&&r.rain>=40);
 const score=r=>r.rain===null||r.temp===null||r.wind===null?null:(r.rain*.7+Math.max(0,Math.abs(r.temp-68)-12)*1.2+Math.max(0,r.wind-12)*2);
 let best=null;
 for(let i=0;i<=rows.length-2;i++){const a=score(rows[i]),b=score(rows[i+1]);if(a===null||b===null)continue;const total=a+b;if(!best||total<best.score)best={i,score:total}}
 const windowText=best?clock(rows[best.i].time)+'–'+clock(rows[best.i+1].time):'Not enough data';
 set('window',windowText);
 set('rain',maxRain===null?'Unavailable':round(maxRain,'%')+' peak chance');
 set('wind',maxWind===null?'Unavailable':round(maxWind,' mph')+' peak');
 set('temp',temps.length?round(Math.min(...temps),'°')+'–'+round(Math.max(...temps),'°'):'Unavailable');
 const advice=wet?'Rain chance reaches at least 40% around '+clock(wet.time)+'.':'No hour reaches a 40% rain chance in the next 12 hours.';
 const outdoor=best?' The lowest-risk two-hour outdoor window in this forecast is approximately '+windowText+'.':' Outdoor timing cannot be rated with the available hourly data.';
 panel.querySelector('.sw-advisor-lead').textContent=advice+outdoor+' Conditions may change; this is a forecast-based suggestion.';
});
})();
