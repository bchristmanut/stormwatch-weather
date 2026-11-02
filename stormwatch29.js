/* StormWatch Ultimate v29: radar freshness and compact dashboard. */
(()=>{'use strict';
const radar=document.getElementById('radarPanel'),hero=document.getElementById('forecastSection');if(!radar||!hero)return;
const freshness=document.createElement('section');freshness.className='su29-fresh';freshness.setAttribute('aria-label','Radar freshness');
freshness.innerHTML='<div class="su29-head"><strong>Radar data health</strong><span class="su29-pill">Waiting</span></div><p class="su29-message" role="status">Waiting for a radar frame…</p><p class="su29-foot">The radar timestamp reflects past imagery. StormWatch does not extrapolate storm tracks or issue official warnings.</p>';
const map=document.getElementById('radarMap');if(map)map.before(freshness);else radar.prepend(freshness);
const pill=freshness.querySelector('.su29-pill'),message=freshness.querySelector('.su29-message');
let last=null;
function render(){if(!last)return;const age=Math.max(0,Math.round((Date.now()-last.time*1000)/60000));const valid=Number.isFinite(age);const state=!valid?'Unknown':age<=15?'Recent':age<=35?'Delayed':'Old';pill.textContent=state;pill.dataset.state=state;message.textContent=valid?'Radar observation from '+new Date(last.time*1000).toLocaleString()+', approximately '+age+' minutes ago. Frame '+(last.index+1)+' of '+last.count+'.':'Radar observation time unavailable.'}
window.addEventListener('stormwatch:radarframe',e=>{last=e.detail;render()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
const section=document.createElement('section');section.className='su29-layout screen-home';section.innerHTML='<div class="su29-head"><strong>Home display</strong><button type="button" class="su29-toggle" aria-pressed="false">Compact mode: Off</button></div><p>Compact mode reduces secondary details on Home. Forecasts, radar, and alerts remain accessible in their tabs.</p>';
hero.after(section);
const key='stormwatch-compact-home-v1',button=section.querySelector('button');
function set(on){document.body.classList.toggle('su29-compact',on);button.textContent='Compact mode: '+(on?'On':'Off');button.setAttribute('aria-pressed',String(on));try{localStorage.setItem(key,on?'1':'0')}catch{}}
let on=false;try{on=localStorage.getItem(key)==='1'}catch{}set(on);
button.addEventListener('click',()=>set(!document.body.classList.contains('su29-compact')));
})();
