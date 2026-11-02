/* StormWatch v34: local forecast verification trend, with 7/30-day windows. */
(()=>{'use strict';
const journal=document.querySelector('.su32');if(!journal)return;
const view=document.createElement('section');view.className='su34';view.innerHTML='<h3>Accuracy history</h3><div class="su34-actions" role="group" aria-label="Accuracy period"><button type="button" data-days="7" aria-pressed="true">7 days</button><button type="button" data-days="30" aria-pressed="false">30 days</button></div><p class="su34-summary" role="status">Waiting for verified forecast history…</p><div class="su34-chart" role="img" aria-label="Temperature forecast error chart"></div><p class="su34-caption">Daily absolute error in forecast high temperature (°F). Each bar represents a verified day; missing days are not zero-error days. Historical gridded estimates are not station observations.</p>';
journal.append(view);
const chart=view.querySelector('.su34-chart'),summary=view.querySelector('.su34-summary'),key='stormwatch-verification-v32';
let loc=null,days=7;
function read(){try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data:[]}catch{return []}}
function num(x){return typeof x==='number'&&Number.isFinite(x)?x:null}
function render(){if(!loc)return;const end=new Date(),start=new Date(end);start.setDate(start.getDate()-(days-1));const startDay=start.toISOString().slice(0,10),endDay=end.toISOString().slice(0,10);
const rows=read().filter(x=>x.loc===loc&&x.date>=startDay&&x.date<=endDay&&num(x.predictedHigh)!==null&&num(x.observed?.high)!==null).sort((a,b)=>a.date.localeCompare(b.date));
chart.replaceChildren();if(!rows.length){summary.textContent='No verified forecast days in the last '+days+' days. Check completed forecasts after historical data becomes available.';return}
const errors=rows.map(x=>Math.abs(x.predictedHigh-x.observed.high)),mae=errors.reduce((a,b)=>a+b,0)/errors.length;
const rain=rows.filter(x=>num(x.predictedRain)!==null&&num(x.observed.rain)!==null),rainMae=rain.length?rain.reduce((s,x)=>s+Math.abs(x.predictedRain-x.observed.rain),0)/rain.length:null;
summary.textContent=days+'-day window · '+rows.length+' verified day'+(rows.length===1?'':'s')+' · Average high-temp error '+mae.toFixed(1)+'°F'+(rainMae===null?'':' · Rain-total error '+rainMae.toFixed(2)+' in')+'.';
const max=Math.max(1,...errors);for(let i=0;i<rows.length;i++){const row=rows[i],item=document.createElement('div'),track=document.createElement('div'),bar=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');item.className='su34-day';track.className='su34-track';bar.className='su34-bar';bar.style.height=Math.max(3,errors[i]/max*100)+'%';track.append(bar);label.textContent=row.date.slice(5);value.textContent=errors[i].toFixed(1)+'°';item.title=row.date+': '+errors[i].toFixed(1)+'°F absolute error';item.append(value,track,label);chart.append(item)}}
for(const b of view.querySelectorAll('[data-days]'))b.addEventListener('click',()=>{days=Number(b.dataset.days);for(const x of view.querySelectorAll('[data-days]'))x.setAttribute('aria-pressed',String(x===b));render()});
window.addEventListener('stormwatch:updated',e=>{const l=e.detail?.location;if(!Number.isFinite(l?.lat)||!Number.isFinite(l?.lon))return;loc=l.lat.toFixed(2)+','+l.lon.toFixed(2);queueMicrotask(render)});
const check=journal.querySelector('.su32-check');if(check)check.addEventListener('click',()=>{const start=Date.now();const watch=setInterval(()=>{render();if(!check.disabled&&Date.now()-start>500){clearInterval(watch)}if(Date.now()-start>15000)clearInterval(watch)},700)});
})();
