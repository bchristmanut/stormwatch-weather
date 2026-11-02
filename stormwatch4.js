/* StormWatch 4.0 — balanced hybrid presentation. No paid API or account required. */
(()=>{'use strict';
const byId=id=>document.getElementById(id);
const simple=byId('simpleView'),balanced=byId('balancedView'),advanced=byId('detailedView');
const motion=byId('motionToggle');
const valid=new Set(['simple','balanced','advanced']);
function setMode(mode){
 if(!valid.has(mode))mode='balanced';
 document.body.classList.toggle('simple-view',mode==='simple');
 document.body.classList.toggle('balanced-view',mode==='balanced');
 document.body.classList.toggle('advanced-view',mode==='advanced');
 for(const [button,name] of [[simple,'simple'],[balanced,'balanced'],[advanced,'advanced']])button.setAttribute('aria-pressed',String(name===mode));
 localStorage.setItem('stormwatch-view-v4',mode);
 // Keep the earlier dashboard's mode setting aligned without relying on its internal variables.
 localStorage.setItem('stormwatch-view',mode==='simple'?'simple':'detailed');
 if(window.sw3Map)setTimeout(()=>window.sw3Map.invalidateSize(),160);
}
simple.addEventListener('click',()=>setMode('simple'));
balanced.addEventListener('click',()=>setMode('balanced'));
advanced.addEventListener('click',()=>setMode('advanced'));
setMode(localStorage.getItem('stormwatch-view-v4')||'balanced');
const savedMotion=localStorage.getItem('stormwatch-motion');
motion.checked=savedMotion!=='off';
function applyMotion(){document.body.classList.toggle('motion-off',!motion.checked);localStorage.setItem('stormwatch-motion',motion.checked?'on':'off')}
motion.addEventListener('change',applyMotion);applyMotion();
function theme(weather){
 const current=weather?.current;if(!current)return;
 const code=Number(current.weather_code);
 const classes=['weather-clear','weather-cloud','weather-rain','weather-storm','weather-snow','weather-night'];
 document.body.classList.remove(...classes);
 let name='weather-clear';
 if([95,96,99].includes(code))name='weather-storm';
 else if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))name='weather-rain';
 else if([71,73,75,77,85,86].includes(code))name='weather-snow';
 else if([2,3,45,48].includes(code))name='weather-cloud';
 if(current.is_day===0 && !['weather-rain','weather-storm','weather-snow'].includes(name))name='weather-night';
 document.body.classList.add(name);document.documentElement.dataset.weather=name;
}
window.addEventListener('stormwatch:updated',event=>theme(event.detail.weather));
})();
