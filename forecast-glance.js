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
const now=c?.time||h.time[0],start=Math.max(0,h.time.findIndex(t=>t.slice(0,13)>=now.slice(0,13))),end=Math.min(h.time.length,start+12);
const rows=[];for(let i=start;i<end;i++)rows.push({time:h.time[i],chance:h.precipitation_probability?.[i],amount:h.precipitation?.[i],temp:h.temperature_2m?.[i],code:h.weather_code?.[i]});
cards.replaceChildren();hours.replaceChildren();if(!rows.length){status.textContent='Hourly forecast is temporarily unavailable.';return}
const wet=rows.filter(x=>valid(x.chance)&&x.chance>=40),first=wet[0],total=rows.reduce((s,x)=>s+(valid(x.amount)?Math.max(0,x.amount):0),0),peak=rows.reduce((a,x)=>valid(x.chance)&&(!a||x.chance>a.chance)?x:a,null);
const temps=rows.filter(x=>valid(x.temp)),change=temps.length>1?temps.at(-1).temp-temps[0].temp:null;
status.textContent=first?'Rain chances rise around '+hourLabel(first.time)+' (40%+ forecast probability).':'No hourly rain chance reaches 40% in the next 12 hours.';
card('Rain may begin',first?hourLabel(first.time):'Not indicated','At least 40% probability');
card('Peak rain chance',peak?Math.round(peak.chance)+'%':'—',peak?hourLabel(peak.time):'No probability data');
card('Expected precipitation',total.toFixed(2)+' in','Total forecast, next 12 hours');
card('Temperature trend',change===null?'—':(change>0?'+':'')+Math.round(change)+'°F',temps.length>1?Math.round(temps[0].temp)+'° → '+Math.round(temps.at(-1).temp)+'°':'Insufficient hourly data');
for(const x of rows){const row=document.createElement('div'),time=document.createElement('span'),chance=document.createElement('strong'),amount=document.createElement('span'),temp=document.createElement('span');row.className='su42-hour';time.textContent=hourLabel(x.time);chance.textContent=valid(x.chance)?Math.round(x.chance)+'%':'—';amount.textContent=valid(x.amount)?x.amount.toFixed(2)+' in':'—';temp.textContent=valid(x.temp)?Math.round(x.temp)+'°F':'—';row.append(time,chance,amount,temp);hours.append(row)}
});
})();