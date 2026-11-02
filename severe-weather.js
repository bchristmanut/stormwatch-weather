/* StormWatch Severe Weather Center — official NWS active alerts, while app is open */
(()=>{'use strict';
const panel=document.getElementById('alertPanel');if(!panel)return;
const section=document.createElement('div');section.className='sw-severe';
const head=document.createElement('div');head.className='sw-severe-head';
const title=document.createElement('strong');title.textContent='Official NWS alerts';
const refresh=document.createElement('button');refresh.type='button';refresh.textContent='↻ Check alerts';head.append(title,refresh);
const status=document.createElement('p');status.className='sw-severe-status';status.setAttribute('role','status');
const list=document.createElement('div');list.className='sw-severe-list';section.append(head,status,list);panel.insertBefore(section,document.getElementById('alerts'));const legacy=document.getElementById('alerts');if(legacy)legacy.hidden=true;
let current=null,controller=null,lastCheck=0;
const PREF_KEY='stormwatch-alert-preferences-v66',SEEN_KEY='stormwatch-seen-alerts-v66';
let preferences;try{preferences=JSON.parse(localStorage.getItem(PREF_KEY)||'{}')||{}}catch{preferences={}}
const severities=['Extreme','Severe','Moderate','Minor','Unknown'];
let latestFeatures=[],knownLocation='',newIds=new Set();
const settings=document.querySelector('.sw60-settings');
if(settings){const options=document.createElement('section');options.className='sw66-alert-settings';const title=document.createElement('h3');title.textContent='Alert display preferences';const note=document.createElement('p');note.textContent='Choose which official NWS alert severities appear in the Alerts list. These filters do not change official alerts or provide background notifications. Keep Extreme and Severe enabled for safety.';options.append(title,note);for(const severity of severities){const row=document.createElement('label');row.className='sw60-option';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=preferences[severity]!==false;checkbox.addEventListener('change',()=>{preferences[severity]=checkbox.checked;try{localStorage.setItem(PREF_KEY,JSON.stringify(preferences))}catch{}render(latestFeatures)});row.append(checkbox,document.createTextNode(severity+' severity'));options.append(row)}settings.append(options)}
const badge=document.createElement('span');badge.className='sw66-new-count';badge.hidden=true;head.append(badge);
function identity(f){const p=f.properties||{};return String(f.id||p.id||p['@id']||[p.event,p.areaDesc,p.sent,p.effective].join('|'))}
function track(features,loc){const key=loc.lat.toFixed(3)+','+loc.lon.toFixed(3);let stored;try{stored=JSON.parse(localStorage.getItem(SEEN_KEY)||'{}')||{}}catch{stored={}}const ids=features.map(identity);newIds=new Set(Array.isArray(stored[key])?ids.filter(id=>!stored[key].includes(id)):[]);knownLocation=key;stored[key]=ids.slice(0,150);try{localStorage.setItem(SEEN_KEY,JSON.stringify(Object.fromEntries(Object.entries(stored).slice(-8))))}catch{}}

function us(lat,lon){return lat>=24&&lat<=50&&lon>=-125&&lon<=-66||lat>=51&&lat<=72&&lon>=-170&&lon<=-129||lat>=18&&lat<=23&&lon>=-161&&lon<=-154}
function date(v){if(!v)return 'Not specified';const d=new Date(v);return Number.isNaN(d.getTime())?'Not specified':d.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function line(el,label,value){const p=document.createElement('div');p.className='sw-severe-meta';p.textContent=label+': '+(value||'Not specified');el.append(p)}
function render(features){latestFeatures=features;list.replaceChildren();const priority={Extreme:0,Severe:1,Moderate:2,Minor:3,Unknown:4};
 const active=features.filter(f=>{const p=f.properties||{};return !p.expires||new Date(p.expires).getTime()>Date.now()}).sort((a,b)=>(priority[a.properties?.severity]??4)-(priority[b.properties?.severity]??4));
 const visible=active.filter(f=>preferences[f.properties?.severity||'Unknown']!==false);const newlyVisible=visible.filter(f=>newIds.has(identity(f)));badge.hidden=!newlyVisible.length;badge.textContent=newlyVisible.length+' new';const tab=document.querySelector('.app-tabs button[data-screen="alerts"]');if(tab){tab.classList.toggle('sw66-has-new',newlyVisible.length>0);tab.setAttribute('aria-label',newlyVisible.length?'Alerts, '+newlyVisible.length+' new':'Alerts')}
 if(!visible.length){section.dataset.state='clear';const p=document.createElement('p');p.className='sw-severe-status';p.textContent=active.length?'Active alerts exist, but none match your selected severity filters. Check all severities to see every alert.':'No active NWS alerts were returned for this location at the time checked.';list.append(p);return}
 section.dataset.state='active';for(const feature of visible.slice(0,20)){const p=feature.properties||{},card=document.createElement('article');card.className='sw-severe-card';card.dataset.severity=p.severity||'Unknown';
 const badge=document.createElement('span');badge.className='sw-severe-badge';badge.textContent=(p.severity||'Unknown')+' severity';
 const h=document.createElement('h3');h.textContent=p.event||'Weather alert';card.append(badge,h);if(newIds.has(identity(feature))){const mark=document.createElement('span');mark.className='sw66-new-tag';mark.textContent='NEW since previous check';card.append(mark)}const urgency=document.createElement('p');urgency.className='sw-severe-urgency';urgency.textContent=[p.urgency,p.certainty].filter(Boolean).join(' · ');if(urgency.textContent)card.append(urgency);
 line(card,'Area',p.areaDesc);line(card,'Effective',date(p.effective||p.onset));line(card,'Expires',date(p.expires||p.ends));const end=p.expires||p.ends;if(end){const remaining=Math.round((new Date(end).getTime()-Date.now())/60000);if(Number.isFinite(remaining)&&remaining>=0){const countdown=document.createElement('div');countdown.className='sw-severe-countdown';countdown.textContent=remaining<60?'Expires in '+remaining+' min':'Expires in '+Math.floor(remaining/60)+' hr '+remaining%60+' min';card.append(countdown)}}
 const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Read alert and safety instructions';details.append(summary);
 for(const [label,value] of [['Headline',p.headline],['Description',p.description],['Safety instructions',p.instruction]])if(value){const sub=document.createElement('p');const strong=document.createElement('strong');strong.textContent=label+': ';sub.append(strong,document.createTextNode(String(value)));details.append(sub)}
 card.append(details);const link=p.web||p['@id'];if(typeof link==='string'&&/^https:\/\//.test(link)){const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open official NWS alert';card.append(a)}list.append(card)}
 if(visible.length>20){const more=document.createElement('p');more.className='sw-severe-status';more.textContent='Showing the first 20 of '+visible.length+' matching alerts.';list.append(more)}
}
async function check(force=false){if(!current)return;if(!us(current.lat,current.lon)){status.textContent='Official NWS alerts are available for U.S. locations only.';list.replaceChildren();return}
 if(!force&&Date.now()-lastCheck<2*60000)return;
 if(controller)controller.abort();controller=new AbortController();const loc={...current};section.dataset.state='checking';status.textContent='Checking official NWS alerts…';
 const timer=setTimeout(()=>controller.abort(),12000);
 try{const url='https://api.weather.gov/alerts/active?point='+encodeURIComponent(loc.lat.toFixed(4)+','+loc.lon.toFixed(4));
 const response=await fetch(url,{headers:{Accept:'application/geo+json'},signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('NWS service returned '+response.status);
 const data=await response.json();if(current.lat!==loc.lat||current.lon!==loc.lon)return;
 lastCheck=Date.now();track(data.features||[],loc);render(data.features||[]);status.textContent='Official NWS alerts checked '+new Date(lastCheck).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+' · Checked only while StormWatch is open. Not an emergency notification service.';
 }catch(err){if(err.name!=='AbortError'){section.dataset.state='error';status.textContent='Could not check alerts. Existing alert information may be outdated. For urgent warnings, visit weather.gov.'}}
 finally{clearTimeout(timer)}}
refresh.addEventListener('click',()=>check(true));
window.addEventListener('stormwatch:updated',e=>{const loc=e.detail.location;if(!current||current.lat!==loc.lat||current.lon!==loc.lon)lastCheck=0;current=loc;check()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastCheck>5*60000)check(true)});
setInterval(()=>{if(!document.hidden&&navigator.onLine!==false&&Date.now()-lastCheck>5*60000)check(true)},60000);
})();