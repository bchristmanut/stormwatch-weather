/* StormWatch v50: dedicated, focused screens using existing live weather panels. */
(()=>{'use strict';
const main=document.querySelector('main'),status=document.getElementById('status');if(!main||!status)return;
const screens=[
 {id:'home',title:'Your weather',sub:'Current conditions, your weather agent and the next 24 hours.',panels:['forecastSection','weatherAgent','conditionsSummary','hourlyPanel']},
 {id:'radar',title:'Live radar',sub:'Explore precipitation movement, animation and map controls.',panels:['radarPanel']},
 {id:'forecast',title:'Forecast & rain',sub:'Hourly rain details, the 10-day outlook, hourly precipitation and forecast confidence.',panels:['rainPanel','dailyPanel']},
 {id:'alerts',title:'Weather alerts',sub:'Official warnings and severe-weather information for your location.',panels:['alertPanel']},
 {id:'details',title:'Weather details',sub:'More measurements, daylight and nearby observation stations.',panels:['detailsPanel','sunPanel','stationPanel']}
];
const pages=new Map();
const sw58Rain=document.createElement('section');sw58Rain.className='sw58-rain';sw58Rain.setAttribute('aria-label','Upcoming precipitation forecast');const sw58RainTitle=document.createElement('strong');sw58RainTitle.textContent='Rain outlook';const sw58RainText=document.createElement('p');sw58RainText.textContent='Waiting for hourly forecast…';sw58Rain.append(sw58RainTitle,sw58RainText);
const sw51Grid=document.createElement('section');sw51Grid.className='sw51-bento';
const sw51Values={};
const sw54Icons={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',wind:'<path d="M12 2l6 18-6-4-6 4z"/>',drop:'<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13z"/>',sunrise:'<path d="M2 18h20M12 3v10m-4-4 4 4 4-4M4 15h2m12 0h2"/>'};for(const key of ['UV Index','Wind','Humidity','Sunrise']){const tile=document.createElement('article');tile.className='sw51-tile';const label=document.createElement('span');label.textContent=key;const value=document.createElement('strong');value.textContent='—';const glyph=document.createElement('span');glyph.className='sw52-icon';glyph.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+sw54Icons[{'UV Index':'sun','Wind':'wind','Humidity':'drop','Sunrise':'sunrise'}[key]]+'</svg>';glyph.setAttribute('aria-hidden','true');tile.append(label,glyph,value);sw51Grid.append(tile);sw51Values[key]=value}
for(const item of screens){
 const page=document.createElement('section');page.className='sw-page';page.id='sw-page-'+item.id;page.dataset.page=item.id;page.setAttribute('aria-label',item.title);
 const head=document.createElement('div');head.className='sw-page-heading';
 const label=document.createElement('span');label.className='sw-page-eyebrow';label.textContent='STORMWATCH / '+item.id.toUpperCase();
 const title=document.createElement('h1');title.textContent=item.title;
 const sub=document.createElement('p');sub.textContent=item.sub;
 head.append(label,title,sub);page.append(head);
 for(const id of item.panels){const el=document.getElementById(id);if(el)page.append(el)}
 if(item.id==='home'){const hero=document.getElementById('forecastSection');if(hero)hero.after(sw58Rain);const stats=document.getElementById('conditionsSummary');if(stats)stats.after(sw51Grid);else page.append(sw51Grid)}
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
window.addEventListener('stormwatch:updated',e=>{const d=e.detail.weather,c=d.current||{},h=d.hourly||{},day=d.daily||{},i=Math.max(0,(h.time||[]).findIndex(t=>t.slice(0,13)>=(c.time||'').slice(0,13)));const upcoming=(h.time||[]).slice(i,i+12).map((t,k)=>({t,prob:h.precipitation_probability?.[i+k],amount:h.precipitation?.[i+k]}));const firstWet=upcoming.find(x=>(Number.isFinite(x.prob)&&x.prob>=40)||(Number.isFinite(x.amount)&&x.amount>=0.01));const peakWet=upcoming.reduce((a,x)=>Number.isFinite(x.prob)&&(!a||x.prob>a.prob)?x:a,null);if(firstWet){const hr=Number(firstWet.t.slice(11,13));sw58RainText.textContent='Precipitation possible around '+(hr%12||12)+(hr<12?' AM':' PM')+(peakWet?' · Peak hourly chance '+Math.round(peakWet.prob)+'%':'')+'.';sw58Rain.dataset.rain='possible'}else{sw58RainText.textContent=upcoming.some(x=>Number.isFinite(x.prob)||Number.isFinite(x.amount))?'No significant precipitation signal in the next 12 hours.':'Hourly precipitation outlook unavailable.';sw58Rain.dataset.rain='none'}sw51Values['UV Index'].textContent=h.uv_index?.[i]??'—';sw51Values.Wind.textContent=Number.isFinite(c.wind_speed_10m)?Math.round(c.wind_speed_10m)+' mph':'—';sw51Values.Humidity.textContent=Number.isFinite(c.relative_humidity_2m)?Math.round(c.relative_humidity_2m)+'%':'—';const sunrise=day.sunrise?.[0];if(sunrise){const hr=Number(sunrise.slice(11,13));sw51Values.Sunrise.textContent=(hr%12||12)+sunrise.slice(13,16)+(hr<12?' AM':' PM')}else sw51Values.Sunrise.textContent='—';const windTile=sw51Values.Wind.parentElement,arrow=windTile?.querySelector('.sw52-icon');if(arrow)arrow.style.transform=Number.isFinite(c.wind_direction_10m)?'rotate('+c.wind_direction_10m+'deg)':'none';windTile.title=Number.isFinite(c.wind_direction_10m)?'Wind from '+Math.round(c.wind_direction_10m)+'°':'Wind direction unavailable';const rows=document.getElementById('daily')?.children||[];const lows=day.temperature_2m_min||[],highs=day.temperature_2m_max||[];const valid=[...lows.slice(0,10),...highs.slice(0,10)].filter(Number.isFinite);const lo=valid.length?Math.min(...valid):0,span=valid.length?Math.max(1,Math.max(...valid)-lo):1;for(let j=0;j<Math.min(10,rows.length);j++){const row=rows[j];let bar=row.querySelector('.sw54-range');if(!bar){bar=document.createElement('span');bar.className='sw54-range';const fill=document.createElement('span');bar.append(fill);row.append(bar)}const low=lows[j],high=highs[j];bar.hidden=!Number.isFinite(low)||!Number.isFinite(high);if(!bar.hidden){bar.firstElementChild.style.left=((low-lo)/span*100)+'%';bar.firstElementChild.style.width=(Math.max(2,(high-low)/span*100))+'%'}}document.body.dataset.sky=[95,96,99].includes(c.weather_code)?'storm':[71,73,75,77,85,86].includes(c.weather_code)?'snow':[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c.weather_code)?'rain':[2,3,45,48].includes(c.weather_code)?'cloud':c.is_day===0?'night':'clear';});
window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);if(pages.has(name))activate(name,false)});
const hash=location.hash.slice(1);activate(pages.has(hash)?hash:document.body.dataset.screen,false);
})();