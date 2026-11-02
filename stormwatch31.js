/* StormWatch v31: uncluttered home, alert freshness, and resilient controls. */
(()=>{'use strict';
const hero=document.getElementById('forecastSection'),alert=document.getElementById('alertPanel');if(!hero||!alert)return;
const controls=document.createElement('section');controls.className='su31-controls screen-home';
controls.innerHTML='<div class="su31-heading"><strong>Home sections</strong><button type="button" class="su31-toggle" aria-expanded="false">Show section controls</button></div><div class="su31-panel" hidden><p>Show or hide secondary Home features. The main conditions and official alerts stay accessible.</p><div class="su31-options"></div><button type="button" class="su31-reset">Restore all sections</button></div>';
hero.after(controls);
const targets=[['.sw-advisor','Weather Advisor'],['.home-hub','Today in Focus'],['.sw25','Rain intelligence'],['.su29-layout','Compact mode control'],['.su-card.screen-home','Dashboard priorities']];
const key='stormwatch-home-sections-v31',options=controls.querySelector('.su31-options'),panel=controls.querySelector('.su31-panel'),toggle=controls.querySelector('.su31-toggle');
function read(){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function apply(){const state=read();targets.forEach(([selector],i)=>{document.querySelectorAll(selector).forEach(el=>el.classList.toggle('su31-hidden',state[i]===false))})}
function draw(){options.replaceChildren();const state=read();targets.forEach(([selector,name],i)=>{if(!document.querySelector(selector))return;const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=state[i]!==false;input.addEventListener('change',()=>{const next=read();next[i]=input.checked;try{localStorage.setItem(key,JSON.stringify(next))}catch{}apply()});label.append(input,document.createTextNode(name));options.append(label)})}
toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));toggle.textContent=panel.hidden?'Show section controls':'Hide section controls'});
controls.querySelector('.su31-reset').addEventListener('click',()=>{try{localStorage.removeItem(key)}catch{}draw();apply()});
draw();apply();
const note=document.createElement('p');note.className='su31-alert-note';note.textContent='Official NWS warnings are checked when weather updates or you request a refresh. Personal thresholds are forecast-based and only evaluated while the app is open. Do not rely on this web app as your sole source of emergency warnings.';
alert.prepend(note);
window.addEventListener('pageshow',apply);
})();
