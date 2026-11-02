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

/* Install the focused visual layer after deferred layout scripts initialize. */
(()=>{'use strict';
function install(){
 if(document.getElementById('sw-cleanup-theme'))return;
 const style=document.createElement('style');style.id='sw-cleanup-theme';
 style.textContent=`
body .app-tabs{grid-template-columns:repeat(6,minmax(0,1fr));}
body .app-tabs button{min-height:44px;}
body[data-screen=home] main{max-width:680px;}
body[data-screen=home] .top-eyebrow,
body[data-screen=home] .intro-copy,
body[data-screen=home] #sw-page-home>.sw-page-heading,
body[data-screen=home] #forecastSection .hero-kicker{display:none;}
body[data-screen=home] header{background:transparent;border:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;}
body[data-screen=home] .brand b{font-size:13px;letter-spacing:1.4px;}
body[data-screen=home] .brand small{font-size:8px;opacity:.75;}
body[data-screen=home] #forecastSection.hero{min-height:0;margin:8px 0 24px;padding:24px 12px 28px;border:0;border-radius:0;background:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;overflow:visible;}
body[data-screen=home] #forecastSection.hero::before{display:none;}
body[data-screen=home] #forecastSection .location{align-items:center;gap:6px;}
body[data-screen=home] #forecastSection #place{font-size:clamp(26px,7vw,34px);font-weight:400;letter-spacing:-.6px;}
body[data-screen=home] #forecastSection #updated{font-size:11px;opacity:.8;}
body[data-screen=home] #forecastSection .mainweather{margin-top:12px;gap:8px;}
body[data-screen=home] #forecastSection .temp{font-size:clamp(96px,25vw,132px);font-weight:200;line-height:1.05;letter-spacing:-6px;text-shadow:none;}
body[data-screen=home] #forecastSection .degree{font-size:.55em;letter-spacing:0;}
body[data-screen=home] #forecastSection #condition{font-size:21px;font-weight:400;}
body[data-screen=home] #forecastSection #range{font-size:16px;color:inherit;opacity:.9;}
body[data-screen=home] #forecastSection .weatherIcon{font-size:40px;filter:none;}
body[data-screen=home] #sw-page-home .panel,
body[data-screen=home] #sw-page-home .stats>div,
body[data-screen=home] #sw-page-home .sw51-tile,
body[data-screen=home] #sw-page-home .sw58-rain{background:rgba(18,45,78,.54);border:1px solid rgba(255,255,255,.13);border-radius:20px;box-shadow:none;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);}
body[data-screen=home] #sw-page-home .panel h2{font-size:13px;font-weight:600;letter-spacing:.3px;}
body[data-screen=home] #sw-page-home .panel h2::before{display:none;}
body[data-screen=home] #hourlyPanel .hour{background:transparent;border:0;box-shadow:none;border-radius:0;}
body[data-screen=home] #hourlyPanel .hourly{gap:4px;scroll-snap-type:x proximity;}
body[data-screen=home] #hourlyPanel .hour{scroll-snap-align:start;}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
body[data-screen=home] #sw-page-home .panel,
body[data-screen=home] #sw-page-home .stats>div,
body[data-screen=home] #sw-page-home .sw51-tile,
body[data-screen=home] #sw-page-home .sw58-rain{background:rgba(18,45,78,.95);}
}
`;
 document.head.append(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
