/* StormWatch v46: private, on-device interactive weather questions. */
(()=>{'use strict';
const agent=document.getElementById('weatherAgent');if(!agent)return;
const wrap=document.createElement('section');wrap.className='sw-ask';
const title=document.createElement('h3');title.textContent='Ask StormWatch';
const choices=document.createElement('div');choices.className='sw-ask-choices';
const input=document.createElement('input');input.type='text';input.placeholder='Ask about rain, storms, wind, temperature…';input.setAttribute('aria-label','Ask StormWatch a weather question');input.maxLength=180;
const submit=document.createElement('button');submit.type='button';submit.textContent='Ask';
const response=document.createElement('p');response.className='sw-ask-answer';response.setAttribute('role','status');response.textContent='Choose a question or type your own.';
const form=document.createElement('form');form.className='sw-ask-form';form.append(input,submit);
wrap.append(title,choices,form,response);agent.append(wrap);
let latest=null,lastQuestion='',lastTopic='rain',lastPeriod='next 12 hours';
const valid=x=>typeof x==='number'&&Number.isFinite(x);
const hour=s=>{const n=Number(s.slice(11,13));return(n%12||12)+(n<12?' AM':' PM')};
const questions=['Will it rain this afternoon?','What about tonight?','How much rain tomorrow?','Is it good to be outside?','Will it get warmer?'];
function answer(q){
if(!latest?.weather?.hourly?.time?.length)return 'Weather data is not available yet. Refresh the forecast and try again.';
const d=latest.weather,h=d.hourly,now=d.current?.time||h.time[0],found=h.time.findIndex(t=>t.slice(0,13)>=now.slice(0,13)),start=found<0?0:found;
const today=now.slice(0,10),next=new Date(today+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);const tomorrow=next.toISOString().slice(0,10),s=q.toLowerCase();const explicit=/tomorrow|tonight|overnight|afternoon|morning/.test(s);const period=/tomorrow/.test(s)?'tomorrow':/tonight|overnight/.test(s)?'tonight':/afternoon/.test(s)?'afternoon':/morning/.test(s)?'morning':/what about|how about|and then/.test(s)?lastPeriod:'next 12 hours';lastPeriod=period;const indices=[];for(let i=start;i<h.time.length;i++){const t=h.time[i],day=t.slice(0,10),hour=Number(t.slice(11,13));const use=period==='tomorrow'?day===tomorrow:period==='tonight'?(day===today&&hour>=18)||(day===tomorrow&&hour<6):period==='afternoon'?day===today&&hour>=12&&hour<18:period==='morning'?day===today&&hour>=6&&hour<12:i<start+12;if(use)indices.push(i);if(indices.length===24)break}const rows=indices.map(i=>({t:h.time[i],p:h.precipitation_probability?.[i],a:h.precipitation?.[i],temp:h.temperature_2m?.[i],wind:h.wind_speed_10m?.[i],uv:h.uv_index?.[i],code:h.weather_code?.[i]}));
if(!rows.length)return 'No hourly forecast is available for '+period+'. Try another time period.';
const first=rows.find(x=>(valid(x.p)&&x.p>=40)||(valid(x.a)&&x.a>=0.01)),peak=rows.filter(x=>valid(x.p)).sort((a,b)=>b.p-a.p)[0],amounts=rows.filter(x=>valid(x.a)),total=amounts.reduce((s,x)=>s+Math.max(0,x.a),0);
const storms=rows.filter(x=>[95,96,99].includes(x.code)),wind=rows.filter(x=>valid(x.wind)).sort((a,b)=>b.wind-a.wind)[0];
const tempStart=rows[0]?.temp,tempEnd=rows.at(-1)?.temp,change=valid(tempStart)&&valid(tempEnd)?Math.round(tempEnd-tempStart):null;
const rainText=first?'Precipitation is possible around '+hour(first.t)+(valid(first.p)?' ('+Math.round(first.p)+'% hourly chance)':'')+'.':rows.some(x=>valid(x.p)||valid(x.a))?'No strong precipitation signal for '+period+'.':'Precipitation data is unavailable for '+period+'.';
const concern=storms.length?'Thunderstorms are forecast around '+hour(storms[0].t)+'. Check official alerts.':wind?.wind>=30?'Strong forecast wind around '+Math.round(wind.wind)+' mph near '+hour(wind.t)+'.':first&&peak?.p>=70?'Elevated precipitation chance up to '+Math.round(peak.p)+'%.':'No standout concern detected for '+period+'. This does not mean conditions are risk-free.';
const recognized=/how much|amount|total|inches|accumulation|when|rain|precipitation|shower|wet|concern|danger|storm|severe|alert|warning|risk|outside|walk|run|hike|bike|outdoor|safe|warm|cold|temperature|hot|cool|degrees|wind|gust|breez/.test(s);if(!recognized&&!explicit&&!/what about|how about|and then/.test(s))return 'I can help with rain, wind, temperature, storms, and outdoor plans. Try asking about tonight or tomorrow.';const intent=/how much|amount|total|inches|accumulation/.test(s)?'amount':/when|rain|precipitation|shower|wet/.test(s)?'rain':/concern|danger|storm|severe|alert|warning|risk/.test(s)?'concern':/outside|walk|run|hike|bike|outdoor|safe/.test(s)?'outside':/warm|cold|temperature|hot|cool|degrees/.test(s)?'temperature':/wind|gust|breez/.test(s)?'wind':lastTopic;lastTopic=intent;
if(intent==='amount')return amounts.length===rows.length?'Forecast precipitation for '+period+': '+total.toFixed(2)+' inches. This is a model estimate.':'Some hourly precipitation amounts are missing, so a reliable total for '+period+' is unavailable.';
if(intent==='rain')return rainText+(peak?' Peak hourly precipitation chance: '+Math.round(peak.p)+'% around '+hour(peak.t)+'.':'');
if(intent==='concern')return concern+' For current official warnings, open the Alerts tab; this answer does not independently verify active warnings.';
if(intent==='outside')return concern+' '+rainText+' Use caution with outdoor plans, and consult official alerts. This is not a safety clearance.';
if(intent==='temperature')return change===null?'Temperature trend data is incomplete.':(change>0?'Warming ':change<0?'Cooling ':'Little change: ')+Math.abs(change)+'°F over the next 12 forecast hours ('+Math.round(tempStart)+'°F to '+Math.round(tempEnd)+'°F).';
if(intent==='wind')return wind?'Highest available hourly forecast wind: '+Math.round(wind.wind)+' mph around '+hour(wind.t)+'. Gusts may be higher.':'Hourly wind information is unavailable.';
return 'I can answer questions about rain timing, precipitation amounts, temperature, wind, storms, and outdoor plans. Try one of the suggested questions.';
}
function ask(q){lastQuestion=q;response.textContent=answer(q)}
for(const q of questions){const b=document.createElement('button');b.type='button';b.textContent=q;b.addEventListener('click',()=>{input.value=q;ask(q)});choices.append(b)}
form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(q)ask(q)});
submit.addEventListener('click',()=>{const q=input.value.trim();if(q)ask(q)});
window.addEventListener('stormwatch:updated',e=>{latest=e.detail;if(lastQuestion){lastPeriod='next 12 hours';lastTopic='rain';ask(lastQuestion)}});
})();