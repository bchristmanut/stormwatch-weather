/* StormWatch Ultimate v28: radar layer controls and forecast transparency. */
(()=>{'use strict';
const panel=document.getElementById('radarPanel');if(!panel)return;
const box=document.createElement('section');box.className='su28';box.innerHTML='<h3>Radar visibility & history</h3><label class="su28-opacity">Radar opacity <input type="range" min="10" max="100" step="5" value="80" aria-label="Radar layer opacity"><output>80%</output></label><div class="su28-radar-status" role="status">Waiting for radar imagery…</div><p>Radar frames show observed precipitation in the past. Opacity only changes map visibility, not precipitation intensity.</p>';
const map=document.getElementById('radarMap');if(map)map.before(box);else panel.prepend(box);
const slider=box.querySelector('input'),out=box.querySelector('output'),status=box.querySelector('.su28-radar-status');
let opacity=.8;
function updateLayers(){if(typeof sw3Map==='undefined'||!sw3Map)return;sw3Map.eachLayer(layer=>{if(!layer?.options?.attribution?.includes('RainViewer'))return;if(layer===sw3Radar)layer.setOpacity(opacity)})}
slider.addEventListener('input',()=>{opacity=Number(slider.value)/100;out.value=slider.value+'%';updateLayers()});
window.addEventListener('stormwatch:radarframe',e=>{const time=e.detail?.time;status.textContent=time?'Observed radar frame: '+new Date(time*1000).toLocaleString()+' · '+(e.detail.index+1)+' of '+e.detail.count:'Radar frame unavailable';requestAnimationFrame(updateLayers)});
window.addEventListener('stormwatch:radarready',()=>{status.textContent='Radar imagery available. Scrub the radar timeline to review past frames.';requestAnimationFrame(updateLayers)});
const daily=document.getElementById('dailyPanel');if(!daily)return;
const compare=document.createElement('section');compare.className='su28';compare.innerHTML='<h3>Forecast change tracker</h3><p class="su28-changes" role="status">Waiting for updated forecast…</p><p>Compares this forecast with the previous forecast saved on this device for the same coordinates and date. Changes do not prove either forecast is more accurate.</p>';daily.prepend(compare);
const key='stormwatch-forecast-snapshot-v28';
window.addEventListener('stormwatch:updated',e=>{
 const d=e.detail?.weather,loc=e.detail?.location;if(!d?.daily?.time?.length||!loc)return;
 const current={lat:loc.lat,lon:loc.lon,date:d.daily.time[0],high:d.daily.temperature_2m_max?.[0],rain:d.daily.precipitation_sum?.[0],saved:Date.now()};
 let old=null;try{old=JSON.parse(localStorage.getItem(key)||'null')}catch{}
 const same=old&&Math.abs(old.lat-current.lat)<.001&&Math.abs(old.lon-current.lon)<.001&&old.date===current.date;
 const value=(a,b,u,digits=0)=>typeof a==='number'&&typeof b==='number'?(a-b>=0?'+':'')+(a-b).toFixed(digits)+u:'unavailable';
 compare.querySelector('.su28-changes').textContent=same?'Since the previous saved update: high temperature '+value(current.high,old.high,'°F')+'; daily precipitation '+value(current.rain,old.rain,' in',2)+'. Previous snapshot: '+new Date(old.saved).toLocaleString()+'.':'First snapshot saved for this location and forecast date. Changes will appear after a later refresh.';
 try{localStorage.setItem(key,JSON.stringify(current))}catch{}
});
})();
