const sw3=$;
let sw3Map,sw3Radar,sw3Frames=[],sw3Index=0,sw3Timer=null,sw3Location=null,sw3Weather=null;
function sw3Text(parent,tag,value,cls){const n=document.createElement(tag);n.textContent=value;if(cls)n.className=cls;parent.append(n);return n}
function sw3Mode(mode){document.body.classList.toggle('simple-view',mode==='simple');sw3('simpleView').setAttribute('aria-pressed',String(mode==='simple'));sw3('detailedView').setAttribute('aria-pressed',String(mode!=='simple'));localStorage.setItem('stormwatch-view',mode);if(sw3Map)setTimeout(()=>sw3Map.invalidateSize(),100)}
sw3('simpleView').addEventListener('click',()=>sw3Mode('simple'));sw3('detailedView').addEventListener('click',()=>sw3Mode('detailed'));sw3Mode(localStorage.getItem('stormwatch-view')==='simple'?'simple':'detailed');
for(const panel of document.querySelectorAll('section.panel')){const heading=panel.querySelector('h2');if(!heading)continue;const button=document.createElement('button');button.className='panel-toggle';button.type='button';button.textContent='Hide';button.setAttribute('aria-expanded','true');heading.append(button);button.addEventListener('click',()=>{const hidden=panel.classList.toggle('panel-collapsed');button.textContent=hidden?'Show':'Hide';button.setAttribute('aria-expanded',String(!hidden));if(!hidden&&sw3Map)setTimeout(()=>sw3Map.invalidateSize(),100)})}
function sw3Rain(d){const h=d.hourly,c=d.current,ix=Math.max(0,h.time.findIndex(t=>t>=c.time.slice(0,13))),indices=Array.from({length:24},(_,i)=>ix+i).filter(i=>i<h.time.length);const max=Math.max(0,...indices.map(i=>h.precipitation_probability[i]||0));const amount=indices.reduce((sum,i)=>sum+(Number(h.precipitation[i])||0),0);const wet=indices.find(i=>(h.precipitation_probability[i]||0)>=40);sw3('rainSummary').replaceChildren();for(const [a,b] of [['Highest chance, next 24h',max+'%'],['Expected total, next 24h',amount.toFixed(2)+' in'],['First ≥40% rain chance',wet===undefined?'None forecast':h.time[wet].slice(11,16)+' local'],['Today total forecast',Number(d.daily.precipitation_sum[0]||0).toFixed(2)+' in']]){const e=document.createElement('div');e.className='weather-tile';sw3Text(e,'span',a);sw3Text(e,'strong',b);sw3('rainSummary').append(e)}const container=sw3('rainHours');container.replaceChildren();for(const i of indices){const item=document.createElement('div');item.className='rain-hour';sw3Text(item,'span',h.time[i].slice(11,16));const bar=document.createElement('div');bar.className='rain-bar';const fill=document.createElement('div');fill.style.width=Math.max(0,Math.min(100,h.precipitation_probability[i]||0))+'%';bar.append(fill);item.append(bar);sw3Text(item,'b',Math.round(h.precipitation_probability[i]||0)+'%');sw3Text(item,'small',Number(h.precipitation[i]||0).toFixed(2)+' in');container.append(item)}}
function sw3InitMap(){if(sw3Map||!window.L)return;sw3Map=L.map('radarMap',{zoomControl:true,preferCanvas:true}).setView([41.58,-93.62],7);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(sw3Map)}
let sw3Pending=null,sw3FrameToken=0,sw3Speed=1600,sw3Loading=false,sw3RefreshTimer=null;
const sw3Layers=new Map();
function sw3Layer(index){
 const frame=sw3Frames[index];if(!frame)return null;
 const key=String(frame.time);
 if(sw3Layers.has(key))return sw3Layers.get(key);
 const layer=L.tileLayer((window.swRadarHost||'https://tilecache.rainviewer.com')+frame.path+'/256/{z}/{x}/{y}/2/1_1.png',{opacity:0,maxNativeZoom:7,maxZoom:18,attribution:'Radar © RainViewer',updateWhenIdle:false,keepBuffer:1});
 sw3Layers.set(key,layer);return layer;
}
function sw3RenderFrame(){
 if(!sw3Map||!sw3Frames.length)return;
 const frame=sw3Frames[sw3Index],token=++sw3FrameToken,layer=sw3Layer(sw3Index);
 if(sw3Pending&&sw3Pending!==sw3Radar&&sw3Pending!==layer&&sw3Map.hasLayer(sw3Pending))sw3Map.removeLayer(sw3Pending);
 sw3Pending=layer;
 if(!sw3Map.hasLayer(layer))layer.addTo(sw3Map);
 let settled=false;
 function finish(){if(settled||token!==sw3FrameToken)return;settled=true;layer.setOpacity(.78);if(sw3Radar&&sw3Radar!==layer&&sw3Map.hasLayer(sw3Radar))sw3Map.removeLayer(sw3Radar);sw3Radar=layer;sw3Pending=null;sw3('radarStatus').textContent='Radar observation: '+new Date(frame.time*1000).toLocaleString()+' · Past observations, not a forecast';window.dispatchEvent(new CustomEvent('stormwatch:radarframe',{detail:{index:sw3Index,count:sw3Frames.length,time:frame.time}}));sw3PreloadNext()}
 layer.once('load',finish);
 if(layer._loading===false)setTimeout(finish,50);
 setTimeout(finish,Math.min(2200,Math.max(1100,sw3Speed-100)));
}
function sw3PreloadNext(){
 if(!sw3Map||!sw3Frames.length||document.hidden)return;
 const next=(sw3Index+1)%sw3Frames.length,layer=sw3Layer(next);
 if(!sw3Map.hasLayer(layer))layer.addTo(sw3Map);
 layer.setOpacity(0);
 const keep=new Set([String(sw3Frames[sw3Index].time),String(sw3Frames[next].time)]);
 for(const [key,old] of sw3Layers){if(!keep.has(key)){if(sw3Map.hasLayer(old))sw3Map.removeLayer(old);sw3Layers.delete(key)}}
}
async function sw3RadarLoad(preserve=false){
 sw3InitMap();if(!sw3Map){sw3('radarStatus').textContent='Radar map library could not load. Check your connection.';return}
 if(sw3Loading)return;sw3Loading=true;
 try{
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);let response;
 try{response=await fetch('https://api.rainviewer.com/public/weather-maps.json',{cache:'no-store',signal:controller.signal})}finally{clearTimeout(timeout)}
 if(!response.ok)throw Error('Radar service unavailable');
 const data=await response.json(),frames=data.radar?.past||[];
 if(!frames.length)throw Error('No radar frames available');
 const previous=sw3Frames[sw3Index]?.time;
 window.swRadarHost=typeof data.host==='string'&&/^https:\/\//.test(data.host)?data.host:'https://tilecache.rainviewer.com';
 sw3Frames=frames;const oldIndex=preserve?frames.findIndex(f=>f.time===previous):-1;
 sw3Index=oldIndex>=0?oldIndex:frames.length-1;
 for(const [key,layer] of sw3Layers){if(!frames.some(f=>String(f.time)===key)){if(sw3Map.hasLayer(layer))sw3Map.removeLayer(layer);sw3Layers.delete(key)}}
 sw3RenderFrame();window.dispatchEvent(new CustomEvent('stormwatch:radarready',{detail:{count:sw3Frames.length}}));
 }catch(e){sw3('radarStatus').textContent='Radar refresh unavailable: '+e.message+'. Existing imagery may be outdated.'}
 finally{sw3Loading=false}
}
function sw3Pause(){if(sw3Timer){clearInterval(sw3Timer);sw3Timer=null}sw3('radarPlay').textContent='▶ Play'}
function sw3Play(){if(sw3Timer){sw3Pause();return}if(sw3Frames.length<2){sw3('radarStatus').textContent='Animation requires at least two radar frames.';return}sw3Step(1);sw3Timer=setInterval(()=>{if(!document.hidden&&document.body.dataset.screen==='radar')sw3Step(1)},sw3Speed);sw3('radarPlay').textContent='⏸ Pause'}
function sw3SetSpeed(ms){sw3Speed=ms;if(sw3Timer){sw3Pause();sw3Play()}}
function sw3Step(delta){if(!sw3Frames.length)return;sw3Index=(sw3Index+delta+sw3Frames.length)%sw3Frames.length;sw3RenderFrame()}
sw3('radarPrev').addEventListener('click',()=>sw3Step(-1));sw3('radarNext').addEventListener('click',()=>sw3Step(1));sw3('radarHome').addEventListener('click',()=>{if(sw3Map&&sw3Location)sw3Map.setView([sw3Location.lat,sw3Location.lon],8)});
sw3('radarPlay').addEventListener('click',sw3Play);
window.addEventListener('stormwatch:updated',e=>{sw3Weather=e.detail.weather;sw3Location=e.detail.location;sw3Rain(sw3Weather);sw3InitMap();if(sw3Map){sw3Map.setView([sw3Location.lat,sw3Location.lon],8);setTimeout(()=>sw3Map.invalidateSize({pan:false}),200)}});
sw3RadarLoad();
setInterval(()=>{if(navigator.onLine!==false&&!document.hidden)sw3RadarLoad(true)},5*60*1000);

/* Reflow radar when a hidden panel is expanded or device rotates. */
window.addEventListener('resize',()=>{if(sw3Map)sw3Map.invalidateSize({pan:false})});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&sw3Map)setTimeout(()=>sw3Map.invalidateSize({pan:false}),200)});
document.getElementById('radarPanel')?.addEventListener('click',event=>{if(event.target.closest('.panel-toggle')&&sw3Map)setTimeout(()=>sw3Map.invalidateSize({pan:false}),250)});
