/* StormWatch Ultimate stages 2–6. All intelligence is browser-local and forecast-based. */
(()=>{'use strict';
const $=id=>document.getElementById(id),n=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
const fmt=(x,u='')=>n(x)===null?'—':Math.round(x)+u;
const make=(tag,cls,parent,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;if(parent)parent.append(e);return e};
const rainPanel=$('rainPanel'),radarPanel=$('radarPanel'),alertsPanel=$('alertPanel'),daily=$('dailyPanel'),hero=$('forecastSection');
if(!rainPanel||!radarPanel||!alertsPanel||!daily||!hero)return;
const rain=make('section','su-card',rainPanel);rainPanel.prepend(rain);
rain.innerHTML='<h3>☔ RainCast · 6-hour outlook</h3><p class="su-rain-text" role="status">Waiting for forecast…</p><div class="su-rain-bars"></div><p class="su-note">Hourly forecast probabilities and precipitation amounts, not minute-by-minute radar nowcasting. Start/stop times are approximate.</p>';
const tracker=make('section','su-card',radarPanel);radarPanel.prepend(tracker);
tracker.innerHTML='<h3>◎ Storm Tracker tools</h3><p>Use radar playback to compare past precipitation frames. Official warnings appear in the Alerts tab; radar motion alone cannot establish a reliable storm arrival time.</p><div class="su-actions"><button type="button" data-action="play">▶ Radar playback</button><button type="button" data-action="home">⌖ Center map</button><button type="button" data-action="alerts">⚠ Official alerts</button></div>';
tracker.querySelector('[data-action="play"]').onclick=()=>$('radarPlay')?.click();
tracker.querySelector('[data-action="home"]').onclick=()=>$('radarHome')?.click();
tracker.querySelector('[data-action="alerts"]').onclick=()=>document.querySelector('.app-tabs [data-screen="alerts"]')?.click();
const insight=make('section','su-card',daily);daily.prepend(insight);
insight.innerHTML='<h3>◈ Forecast Intelligence</h3><p class="su-insight">Waiting for forecast…</p><p class="su-note">The Forecast Confidence comparison below uses a separate model. Model agreement is not a verified accuracy score.</p>';
const alert=make('section','su-card',alertsPanel);alertsPanel.prepend(alert);
alert.innerHTML='<h3>⚙ Personal weather watch</h3><p>Set thresholds for forecast conditions. Warnings appear while StormWatch is open and weather is refreshed. This is not background push notification delivery.</p><div class="su-controls"><label>Rain chance (%) <input type="number" min="1" max="100" step="5" data-threshold="rain"></label><label>Wind (mph) <input type="number" min="1" max="150" step="5" data-threshold="wind"></label><label>Cold temperature (°F) <input type="number" min="-100" max="100" step="5" data-threshold="cold"></label><label>Hot temperature (°F) <input type="number" min="-50" max="150" step="5" data-threshold="hot"></label></div><div class="su-alert-result" role="status">Waiting for forecast…</div>';
const key='stormwatch-ultimate-thresholds-v1',defaults={rain:70,wind:25,cold:32,hot:95};
function saved(){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return {...defaults,...v}}catch{return {...defaults}}}
const inputs=[...alert.querySelectorAll('[data-threshold]')];
for(const input of inputs){input.value=saved()[input.dataset.threshold];input.addEventListener('change',()=>{const v=Number(input.value);if(!Number.isFinite(v)||input.value===''||v<Number(input.min)||v>Number(input.max)){input.value=saved()[input.dataset.threshold];return}const s=saved();s[input.dataset.threshold]=v;try{localStorage.setItem(key,JSON.stringify(s))}catch{}if(last)update(last)})}
const dashboard=make('section','su-card screen-home',hero.parentElement);hero.after(dashboard);
dashboard.innerHTML='<h3>✦ Your weather dashboard</h3><p>Choose what appears first on Home. Your preference stays on this device.</p><div class="su-actions"><button type="button" data-priority="rain">Rain first</button><button type="button" data-priority="advisor">Advisor first</button><button type="button" data-priority="default">Default order</button></div>';
const priorityKey='stormwatch-ultimate-priority-v1';
function priority(value){try{if(value)localStorage.setItem(priorityKey,value);else value=localStorage.getItem(priorityKey)||'default'}catch{value=value||'default'}
 const advisor=document.querySelector('.sw-advisor'),hub=document.querySelector('.home-hub'),intelligence=document.querySelector('.sw25');
 if(value==='advisor'&&advisor)hero.after(advisor);else if(value==='rain'&&intelligence)hero.after(intelligence);else if(hub)hero.after(hub);
 for(const button of dashboard.querySelectorAll('[data-priority]'))button.setAttribute('aria-pressed',String(button.dataset.priority===value))}
for(const button of dashboard.querySelectorAll('[data-priority]'))button.onclick=()=>priority(button.dataset.priority);
priority();
let last=null;
function update(d){last=d;const h=d.hourly,c=d.current||{};if(!h?.time?.length)return;const start=Math.max(0,h.time.findIndex(t=>t>=String(c.time||h.time[0]).slice(0,13)));
const rows=h.time.slice(start,start+12).map((time,j)=>{const i=start+j;return {time,p:n(h.precipitation_probability?.[i]),amount:n(h.precipitation?.[i]),wind:n(h.wind_speed_10m?.[i]),temp:n(h.temperature_2m?.[i])}});
const six=rows.slice(0,6),wet=six.find(r=>r.p!==null&&r.p>=40),peak=six.reduce((m,r)=>Math.max(m,r.p??0),0),amount=six.reduce((sum,r)=>sum+(r.amount??0),0);
rain.querySelector('.su-rain-text').textContent=(wet?'First hour with ≥40% rain chance: '+wet.time.slice(11,16)+' local. ':'No hour reaches 40% rain chance in the next 6 hours. ')+'Peak hourly chance: '+peak+'%. Forecast precipitation total: '+amount.toFixed(2)+' in.';
const bars=rain.querySelector('.su-rain-bars');bars.replaceChildren();for(const r of six){const el=make('div','su-rain-hour',bars),bar=make('div','su-rain-track',el),fill=make('div','su-rain-fill',bar);fill.style.height=Math.max(0,Math.min(100,r.p??0))+'%';make('strong','',el,fmt(r.p,'%'));make('small','',el,r.time.slice(11,16))}
const day=d.daily||{};insight.querySelector('.su-insight').textContent='Today: '+fmt(day.temperature_2m_min?.[0],'°F')+' to '+fmt(day.temperature_2m_max?.[0],'°F')+'. Tomorrow: '+fmt(day.temperature_2m_min?.[1],'°F')+' to '+fmt(day.temperature_2m_max?.[1],'°F')+'. Rain probability today: '+fmt(day.precipitation_probability_max?.[0],'%')+'. Compare forecast models in the panel below.';
const thresholds=saved(),matches=[];for(const r of rows){const time=r.time.slice(11,16);if(r.p!==null&&r.p>=thresholds.rain)matches.push('Rain chance '+fmt(r.p,'%')+' at '+time);if(r.wind!==null&&r.wind>=thresholds.wind)matches.push('Wind '+fmt(r.wind,' mph')+' at '+time);if(r.temp!==null&&r.temp<=thresholds.cold)matches.push('Cold '+fmt(r.temp,'°F')+' at '+time);if(r.temp!==null&&r.temp>=thresholds.hot)matches.push('Heat '+fmt(r.temp,'°F')+' at '+time)}
alert.querySelector('.su-alert-result').textContent=matches.length?matches.slice(0,5).join(' · ')+(matches.length>5?' · and '+(matches.length-5)+' more matching hours':''):'No threshold crossings in the next 12 forecast hours.';}
window.addEventListener('stormwatch:updated',e=>{if(e.detail?.weather)update(e.detail.weather)});
})();
