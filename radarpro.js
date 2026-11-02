/* StormWatch Radar Pro — map controls, timeline, NWS geometry overlays */
(()=>{'use strict';
const panel=document.getElementById('radarPanel'),mapNode=document.getElementById('radarMap');
if(!panel||!mapNode)return;
const toolbar=document.createElement('div');toolbar.className='rp-toolbar';
const title=document.createElement('strong');title.textContent='RADAR PRO · OBSERVED PRECIPITATION';
const full=document.createElement('button');full.type='button';full.textContent='⛶ Full screen';full.setAttribute('aria-pressed','false');
toolbar.append(title,full);mapNode.before(toolbar);
const controls=document.createElement('div');controls.className='rp-controls';
const timeRow=document.createElement('div');timeRow.className='rp-time-row';const time=document.createElement('strong');time.textContent='Loading radar history…';const counter=document.createElement('span');timeRow.append(time,counter);
const slider=document.createElement('input');slider.type='range';slider.className='rp-timeline';slider.min='0';slider.max='0';slider.value='0';slider.setAttribute('aria-label','Radar observation timeline');
const speedWrap=document.createElement('label');speedWrap.className='rp-speed';speedWrap.textContent='Playback speed ';const speed=document.createElement('select');speed.setAttribute('aria-label','Radar playback speed');for(const [label,ms] of [['Slow','2400'],['Normal','1600'],['Fast','1000']]){const option=document.createElement('option');option.value=ms;option.textContent=label;if(ms==='1600')option.selected=true;speed.append(option)}speedWrap.append(speed);speed.addEventListener('change',()=>{if(typeof sw3SetSpeed==='function')sw3SetSpeed(Number(speed.value))});
const warningToggle=document.createElement('label');warningToggle.className='rp-toggle';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=true;warningToggle.append(checkbox,document.createTextNode(' Show warning boundaries'));
const legend=document.createElement('div');legend.className='rp-legend';for(const [name,cls] of [['Light','l1'],['Moderate','l2'],['Heavy','l3'],['Very heavy','l4'],['Extreme','l5']]){const span=document.createElement('span');const square=document.createElement('i');square.className=cls;span.append(square,document.createTextNode(name));legend.append(span)}
const note=document.createElement('p');note.className='rp-warning';note.textContent='Radar frames show past observations, not future storm movement. Colors are an approximate guide; warning outlines depend on available NWS geometry.';
controls.append(timeRow,slider,speedWrap,warningToggle,legend,note);
const actions=panel.querySelector('.radar-actions');if(actions)actions.after(controls);else mapNode.after(controls);
const mapReady=()=>typeof sw3Map!=='undefined'&&sw3Map&&typeof L!=='undefined';
function refreshSize(){if(mapReady())requestAnimationFrame(()=>setTimeout(()=>sw3Map.invalidateSize({pan:false}),160))}
full.addEventListener('click',()=>{const on=panel.classList.toggle('rp-fullscreen');document.body.classList.toggle('rp-modal',on);full.textContent=on?'✕ Close full screen':'⛶ Full screen';full.setAttribute('aria-pressed',String(on));refreshSize()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('rp-fullscreen'))full.click()});
slider.addEventListener('input',()=>{if(typeof sw3Frames==='undefined'||!sw3Frames.length)return;if(typeof sw3Pause==='function')sw3Pause();sw3Index=Number(slider.value);sw3RenderFrame();update()});
function update(){if(typeof sw3Frames==='undefined'||!sw3Frames.length)return;slider.max=String(sw3Frames.length-1);slider.value=String(sw3Index);const frame=sw3Frames[sw3Index];time.textContent=new Date(frame.time*1000).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});counter.textContent=(sw3Index+1)+' / '+sw3Frames.length+' frames';slider.setAttribute('aria-valuetext','Radar observation '+new Date(frame.time*1000).toLocaleString())}
let warnings=null,warningLayer=null,abort=null;
async function fetchWarnings(location){if(!location||!mapReady())return;if(abort)abort.abort();abort=new AbortController();try{const url='https://api.weather.gov/alerts/active?point='+encodeURIComponent(location.lat+','+location.lon);const response=await fetch(url,{headers:{Accept:'application/geo+json'},signal:abort.signal});if(!response.ok)throw Error('NWS alerts unavailable');const data=await response.json();warnings=data.features||[];drawWarnings()}catch(e){if(e.name!=='AbortError')note.textContent='Radar observations are available. Warning boundaries could not be loaded; check official NWS alerts below.'}}
function drawWarnings(){if(!mapReady())return;if(warningLayer){sw3Map.removeLayer(warningLayer);warningLayer=null}if(!checkbox.checked||!warnings)return;const polygons=warnings.filter(f=>f.geometry&&['Polygon','MultiPolygon'].includes(f.geometry.type));if(!polygons.length){note.textContent='No active warning polygons are available for this point. Some NWS alerts do not provide geographic boundaries.';return}warningLayer=L.geoJSON({type:'FeatureCollection',features:polygons},{style:f=>({color:f.properties?.severity==='Extreme'?'#ff3966':f.properties?.severity==='Severe'?'#ff874c':'#ffca67',weight:3,opacity:.95,fillOpacity:.1}),onEachFeature:(f,layer)=>{const p=f.properties||{};layer.bindPopup(String(p.event||'Weather alert')+' — '+String(p.severity||'Unknown severity')+' · '+String(p.expires?new Date(p.expires).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'Expiration unknown'))}}).addTo(sw3Map);note.textContent=polygons.length+' active warning boundary layer(s) shown. Always follow official NWS warnings.'}
checkbox.addEventListener('change',drawWarnings);
window.addEventListener('stormwatch:updated',e=>{refreshSize();fetchWarnings(e.detail.location)});
window.addEventListener('stormwatch:radarready',update);window.addEventListener('stormwatch:radarframe',update);
const observer=new MutationObserver(()=>{if(document.body.dataset.screen==='radar')refreshSize()});observer.observe(document.body,{attributes:true,attributeFilter:['data-screen']});
window.addEventListener('resize',refreshSize);
setTimeout(()=>{refreshSize();update()},400);
})();