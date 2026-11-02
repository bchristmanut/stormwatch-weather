/* StormWatch v42: immediate forecast outlook based on provider hourly data. */
(()=>{'use strict';
const panel=document.getElementById('dailyPanel');if(!panel)return;
const section=document.createElement('section');section.className='su42';section.innerHTML='<h3>Next 12 hours at a glance</h3><p class="su42-status">Waiting for forecast…</p><div class="su42-cards"></div><div class="su42-hours"></div><p class="su42-note">Forecast estimates, not live rain measurements. Rain timing and amounts may change.</p>';
panel.prepend(section);
const status=section.querySelector('.su42-status'),cards=section.querySelector('.su42-cards'),hours=section.querySelector('.su42-hours');
const valid=x=>typeof x==='number'&&Number.isFinite(x);
function card(label,value,detail){const box=document.createElement('div'),small=document.createElement('span'),strong=document.createElement('strong'),sub=document.createElement('small');small.textContent=label;strong.textContent=value;sub.textContent=detail;box.append(small,strong,sub);cards.append(box)}
function hourLabel(s){const h=Number(s.slice(11,13));return(h%12||12)+(h<12?' AM':' PM')}
window.addEventListener('stormwatch:updated',e=>{const d=e.detail?.weather,h=d?.hourly,c=d?.current;if(!Array.isArray(h?.time)||!h.time.length)return;
const now=c?.time||h.time[0],found=h.time.findIndex(t=>t.slice(0,13)>=now.slice(0,13)),start=found<0?Math.max(0,h.time.length-12):found,end=Math.min(h.time.length,start+12);
const rows=[];for(let i=start;i<end;i++)rows.push({time:h.time[i],chance:h.precipitation_probability?.[i],amount:h.precipitation?.[i],temp:h.temperature_2m?.[i],code:h.weather_code?.[i]});
cards.replaceChildren();hours.replaceChildren();if(!rows.length){status.textContent='Hourly forecast is temporarily unavailable.';return}
const wet=rows.filter(x=>(valid(x.chance)&&x.chance>=40)||(valid(x.amount)&&x.amount>=0.01)),first=wet[0],amountRows=rows.filter(x=>valid(x.amount)),total=amountRows.reduce((s,x)=>s+Math.max(0,x.amount),0),peak=rows.reduce((a,x)=>valid(x.chance)&&(!a||x.chance>a.chance)?x:a,null);
const temps=rows.filter(x=>valid(x.temp)),change=temps.length>1?temps.at(-1).temp-temps[0].temp:null;
status.textContent=first?'Possible precipitation around '+hourLabel(first.time)+' (at least 40% chance or 0.01 in forecast).':'No significant precipitation signal in the available hourly forecast.';
card('Possible precipitation',first?hourLabel(first.time):'Not indicated','Chance ≥40% or amount ≥0.01 in');
card('Peak rain chance',peak?Math.round(peak.chance)+'%':'—',peak?hourLabel(peak.time):'No probability data');
card('Expected precipitation',amountRows.length?total.toFixed(2)+' in':'—',amountRows.length===rows.length?'Forecast total, next 12 hours':'Incomplete hourly amount data');
card('Temperature trend',change===null?'—':(change>0?'+':'')+Math.round(change)+'°F',temps.length>1?Math.round(temps[0].temp)+'° → '+Math.round(temps.at(-1).temp)+'°':'Insufficient hourly data');
for(const x of rows){const row=document.createElement('div'),time=document.createElement('span'),chance=document.createElement('strong'),amount=document.createElement('span'),temp=document.createElement('span');row.className='su42-hour';time.textContent=hourLabel(x.time);chance.textContent=valid(x.chance)?Math.round(x.chance)+'%':'—';amount.textContent=valid(x.amount)?x.amount.toFixed(2)+' in':'—';temp.textContent=valid(x.temp)?Math.round(x.temp)+'°F':'—';row.append(time,chance,amount,temp);hours.append(row)}
});
})();