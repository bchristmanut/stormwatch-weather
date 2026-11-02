/* StormWatch iPhone interaction and accessibility enhancements */
(()=>{'use strict';
const main=document.querySelector('main'),status=document.getElementById('status'),refresh=document.getElementById('refresh'),tabs=[...document.querySelectorAll('.app-tabs button[data-screen]')];
if(!main||!status)return;
const skip=document.createElement('a');skip.className='sw-skip';skip.href='#forecastSection';skip.textContent='Skip to weather forecast';document.body.prepend(skip);
main.setAttribute('id','main-content');
const toast=document.createElement('div');toast.className='sw-toast';toast.hidden=true;toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);
let toastTimer=null;function announce(message){toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2600)}
const regionNames={home:'Home',radar:'Radar',forecast:'Forecast',alerts:'Alerts',details:'Details'};
const nav=document.querySelector('.app-tabs');if(nav){nav.setAttribute('aria-label','Weather screens');for(const tab of tabs){tab.setAttribute('aria-label',regionNames[tab.dataset.screen]||tab.dataset.screen);tab.setAttribute('type','button')}}
function syncTabs(){for(const tab of tabs){const active=tab.dataset.screen===document.body.dataset.screen;tab.setAttribute('aria-selected',String(active));tab.setAttribute('aria-current',active?'page':'false')}}
const observer=new MutationObserver(syncTabs);observer.observe(document.body,{attributes:true,attributeFilter:['data-screen']});syncTabs();
if(nav)nav.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const active=tabs.indexOf(document.activeElement);if(active<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(active+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click()});
const statusObserver=new MutationObserver(()=>{const text=status.textContent||'';const loading=/Updating live weather|Searching locations|Requesting iPhone location|Connection restored/.test(text);document.body.classList.toggle('sw-loading',loading);if(refresh)refresh.setAttribute('aria-busy',String(loading))});
statusObserver.observe(status,{childList:true,characterData:true,subtree:true});
window.addEventListener('stormwatch:updated',e=>{const name=e.detail.location?.name||'your location';announce('Weather updated for '+name)});
const media=window.matchMedia('(prefers-reduced-motion: reduce)');function motion(){if(media.matches)document.documentElement.classList.add('sw-reduce-motion');else document.documentElement.classList.remove('sw-reduce-motion')}motion();media.addEventListener?.('change',motion);
const search=document.getElementById('city');if(search)search.setAttribute('enterkeyhint','search');
const locationButtons=document.querySelectorAll('.sw-location-remove');for(const b of locationButtons)b.setAttribute('type','button');
})();