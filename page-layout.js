/* StormWatch v50: dedicated, focused screens using existing live weather panels. */
(()=>{'use strict';
const main=document.querySelector('main'),status=document.getElementById('status');if(!main||!status)return;
const screens=[
 {id:'home',title:'Your weather',sub:'Current conditions, your weather agent and the next 24 hours.',panels:['forecastSection','weatherAgent','conditionsSummary','hourlyPanel']},
 {id:'radar',title:'Live radar',sub:'Explore precipitation movement, animation and map controls.',panels:['radarPanel']},
 {id:'forecast',title:'Forecast & rain',sub:'Hourly rain details, the 16-day outlook and forecast confidence.',panels:['rainPanel','dailyPanel']},
 {id:'alerts',title:'Weather alerts',sub:'Official warnings and severe-weather information for your location.',panels:['alertPanel']},
 {id:'details',title:'Weather details',sub:'More measurements, daylight and nearby observation stations.',panels:['detailsPanel','sunPanel','stationPanel']}
];
const pages=new Map();
const sw51Ready=true;
const sw51Grid=document.createElement('section');sw51Grid.className='sw51-bento';
for(const item of screens){
 const page=document.createElement('section');page.className='sw-page';page.id='sw-page-'+item.id;page.dataset.page=item.id;page.setAttribute('aria-label',item.title);
 const head=document.createElement('div');head.className='sw-page-heading';
 const label=document.createElement('span');label.className='sw-page-eyebrow';label.textContent='STORMWATCH / '+item.id.toUpperCase();
 const title=document.createElement('h1');title.textContent=item.title;
 const sub=document.createElement('p');sub.textContent=item.sub;
 head.append(label,title,sub);page.append(head);
 for(const id of item.panels){const el=document.getElementById(id);if(el)page.append(el)}
 pages.set(item.id,page);main.insertBefore(page,main.querySelector('footer'));
}
const tabs=[...document.querySelectorAll('.app-tabs button[data-screen]')];
function activate(name,updateHash){
 const screen=pages.has(name)?name:'home';
 document.body.dataset.screen=screen;
 for(const [key,page] of pages){page.hidden=key!==screen;page.setAttribute('aria-hidden',String(key!==screen))}
 for(const tab of tabs){if(tab.dataset.screen===screen)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current')}
 if(updateHash)history.replaceState(null,'','#'+screen);
 if(screen==='radar')setTimeout(()=>{if(typeof sw3Map!=='undefined'&&sw3Map)sw3Map.invalidateSize({pan:false})},250);
}
for(const tab of tabs)tab.addEventListener('click',()=>activate(tab.dataset.screen,true));
for(const link of document.querySelectorAll('.quick-nav a'))link.addEventListener('click',e=>{const target=link.getAttribute('href')?.slice(1),page=screens.find(s=>s.panels.includes(target));if(page){e.preventDefault();activate(page.id,true)}});
window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);if(pages.has(name))activate(name,false)});
const hash=location.hash.slice(1);activate(pages.has(hash)?hash:document.body.dataset.screen,false);
})();