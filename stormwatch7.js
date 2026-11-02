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
 window.scrollTo({top:0,behavior:'instant'});
 if(screen==='radar'&&typeof sw3Map!=='undefined'&&sw3Map){requestAnimationFrame(()=>setTimeout(()=>sw3Map.invalidateSize({pan:false}),180))}
}
for(const tab of tabs)tab.addEventListener('click',()=>show(tab.dataset.screen));
for(const link of document.querySelectorAll('.quick-nav a'))link.addEventListener('click',event=>{const target=link.getAttribute('href');const id=target?.slice(1);const screen=map[id];if(screen){event.preventDefault();show(screen)}});
const hash=location.hash.slice(1);show(map[hash]||'home');
})();