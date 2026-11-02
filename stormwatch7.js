/* StormWatch 6 — mockup-inspired working screen navigation */
(()=>{'use strict';
const screens=['home','radar','forecast','alerts','details'];
const map={forecastSection:'home',conditionsSummary:'home',hourlyPanel:'home',rainPanel:'home',radarPanel:'radar',alertPanel:'alerts',dailyPanel:'forecast',detailsPanel:'details',sunPanel:'details',stationPanel:'details'};
for(const [id,screen] of Object.entries(map)){const el=document.getElementById(id);if(el)el.classList.add('screen-'+screen)}
// Reorder existing weather panels; no duplicate IDs or duplicate weather requests.
const main=document.querySelector('main'),hero=document.getElementById('forecastSection'),hourly=document.getElementById('hourlyPanel'),rain=document.getElementById('rainPanel');
if(main&&hero&&hourly&&rain){hero.after(hourly);hourly.after(rain)}
const tabs=[...document.querySelectorAll('.app-tabs button[data-screen]')];
function show(screen){
 if(!screens.includes(screen))screen='home';
 document.body.dataset.screen=screen;
 for(const tab of tabs){if(tab.dataset.screen===screen)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current')}
 try{sessionStorage.setItem('stormwatch-screen',screen)}catch{}
 try{window.scrollTo(0,0)}catch{}
 if(screen==='radar'&&typeof sw3Map!=='undefined'&&sw3Map){requestAnimationFrame(()=>setTimeout(()=>sw3Map.invalidateSize({pan:false}),220))}else if(typeof sw3Pause==='function')sw3Pause();
}
for(const tab of tabs)tab.addEventListener('click',()=>show(tab.dataset.screen));
for(const link of document.querySelectorAll('.quick-nav a'))link.addEventListener('click',event=>{const target=link.getAttribute('href');const id=target?.slice(1);const screen=map[id];if(screen){event.preventDefault();show(screen)}});
const hash=location.hash.slice(1);let savedScreen='home';try{savedScreen=sessionStorage.getItem('stormwatch-screen')||'home'}catch{}show(map[hash]||savedScreen);
window.addEventListener('pageshow',()=>{if(document.body.dataset.screen==='radar'&&typeof sw3Map!=='undefined'&&sw3Map)setTimeout(()=>sw3Map.invalidateSize({pan:false}),250)});
})();