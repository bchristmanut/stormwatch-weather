/* StormWatch v30: radar history diagnostics, not extrapolated storm predictions. */
(()=>{'use strict';
const panel=document.getElementById('radarPanel');if(!panel)return;
const root=document.createElement('section');root.className='su30';root.innerHTML='<h3>Radar observation history</h3><p class="su30-summary" role="status">Waiting for radar observations…</p><div class="su30-facts"></div><p>Frame intervals describe the radar imagery available to this app. They do not measure storm speed, direction, or future arrival times.</p>';
const map=document.getElementById('radarMap');if(map)map.before(root);else panel.prepend(root);
const summary=root.querySelector('.su30-summary'),facts=root.querySelector('.su30-facts');
const tile=(name,value)=>{const el=document.createElement('div'),a=document.createElement('span'),b=document.createElement('strong');a.textContent=name;b.textContent=value;el.append(a,b);facts.append(el)};
function update(){if(typeof sw3Frames==='undefined'||!Array.isArray(sw3Frames)||!sw3Frames.length){summary.textContent='Radar history is not available yet.';return}
const times=sw3Frames.map(f=>Number(f.time)).filter(Number.isFinite).sort((a,b)=>a-b);if(!times.length)return;
const minutes=(times[times.length-1]-times[0])/60;
const gaps=times.slice(1).map((t,i)=>(t-times[i])/60).filter(v=>v>0);
const median=gaps.length?gaps.sort((a,b)=>a-b)[Math.floor(gaps.length/2)]:null;
summary.textContent='Available imagery covers '+Math.round(minutes)+' minutes, from '+new Date(times[0]*1000).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+' to '+new Date(times[times.length-1]*1000).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'.';
facts.replaceChildren();tile('Frames',String(times.length));tile('Typical frame spacing',median===null?'—':Math.round(median)+' min');tile('History duration',Math.round(minutes)+' min');
}
window.addEventListener('stormwatch:radarready',update);
window.addEventListener('stormwatch:radarframe',update);
})();
