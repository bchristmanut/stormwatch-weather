/* StormWatch rain visualization: hourly forecasts, no paid service */
(()=>{'use strict';
const rain=document.getElementById('rainPanel'),summary=document.getElementById('rainSummary');
if(!rain||!summary)return;
const visual=document.createElement('div');visual.className='rain-visual';
const title=document.createElement('div');title.className='rain-chart-heading';
const heading=document.createElement('strong');heading.textContent='Precipitation · next 24 hours';
const meta=document.createElement('span');meta.textContent='Hourly forecast';
title.append(heading,meta);
const chart=document.createElement('div');chart.className='rain-chart';chart.setAttribute('role','img');chart.setAttribute('aria-label','Hourly precipitation probability and amount chart');
const times=document.createElement('div');times.className='rain-chart-times';
const key=document.createElement('div');key.className='rain-chart-key';
const legendA=document.createElement('span');legendA.innerHTML='<i></i>Expected rain';
const legendB=document.createElement('span');legendB.innerHTML='<i class="prob-key"></i>Rain chance';
key.append(legendA,legendB);
const note=document.createElement('p');note.className='rain-highlight';
visual.append(title,chart,times,key,note);summary.before(visual);
function displayHour(iso){const hour=Number(iso.slice(11,13));return ((hour+11)%12+1)+(hour<12?' AM':' PM')}
function render(weather){
 const h=weather?.hourly,c=weather?.current;if(!h||!c)return;
 const first=Math.max(0,h.time.findIndex(t=>t>=c.time.slice(0,13)));
 const points=Array.from({length:24},(_,n)=>first+n).filter(i=>i<h.time.length);
 if(!points.length)return;
 const amount=i=>Math.max(0,Number(h.precipitation?.[i])||0);
 const chance=i=>Math.max(0,Math.min(100,Number(h.precipitation_probability?.[i])||0));
 const maxAmount=Math.max(.02,...points.map(amount));
 chart.replaceChildren();times.replaceChildren();
 let total=0,peak=0,peakIndex=points[0];
 for(const i of points){
  total+=amount(i);if(chance(i)>peak){peak=chance(i);peakIndex=i}
  const col=document.createElement('div');col.className='rain-column';
  const probability=document.createElement('div');probability.className='rain-prob';probability.style.height=(chance(i)*.3)+'%';
  const rainfall=document.createElement('div');rainfall.className='rain-amount';rainfall.style.height=(amount(i)/maxAmount*70)+'%';
  col.title=displayHour(h.time[i])+': '+chance(i)+'% chance, '+amount(i).toFixed(2)+' in expected';
  col.append(probability,rainfall);chart.append(col);
 }
 for(const offset of [0,6,12,18,23]){const index=points[Math.min(offset,points.length-1)];const el=document.createElement('span');el.textContent=displayHour(h.time[index]);times.append(el)}
 chart.setAttribute('aria-label','Next 24 hours: maximum rain chance '+peak+' percent; expected total '+total.toFixed(2)+' inches');
 meta.textContent=total.toFixed(2)+' in expected';
 note.textContent=peak===0?'Little or no rain is forecast over the next 24 hours.':'Highest rain chance: '+peak+'% around '+displayHour(h.time[peakIndex])+'. Expected total: '+total.toFixed(2)+' in.';
}
window.addEventListener('stormwatch:updated',event=>render(event.detail.weather));
})();