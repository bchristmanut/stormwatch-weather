/* StormWatch offline shell v25. Network first for pages, cached fallback for offline use. */
const CACHE='stormwatch-shell-v53';
const ASSETS=['./','./index.html','./style.css','./app.js','./stormwatch3.js','./stormwatch4.js','./stormwatch5.js','./stormwatch6.js','./stormwatch7.js','./radarpro.js','./locations.js','./forecast-confidence.js','./iphone-polish.js','./severe-weather.js','./weather-timeline.js','./interactive-extras.js','./home-refresh.js','./stormwatch25.js','./weather-advisor.js','./stormwatch-ultimate.js','./stormwatch28.js','./stormwatch29.js','./stormwatch30.js','./stormwatch31.js','./forecast-verification.js','./forecast-history.js','./station-check.js','./station-history.js','./forecast-layout.js','./forecast-glance.js','./weather-agent.js','./weather-agent-chat.js','./page-layout.js','./manifest.webmanifest','./icon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('stormwatch-shell-')&&key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{})}return response}
  catch{const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;if(request.mode==='navigate'){const page=await caches.match('./index.html');if(page)return page}return Response.error()}
 })());
});
