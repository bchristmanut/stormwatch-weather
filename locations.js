/* StormWatch Saved Cities — device-local favorites */
(()=>{'use strict';
const search=document.querySelector('.search');if(!search||!window.stormwatchLocation)return;
const key='stormwatch-favorite-cities-v1',limit=12;
function valid(x){return x&&Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lon))&&Math.abs(Number(x.lat))<=90&&Math.abs(Number(x.lon))<=180&&typeof x.name==='string'&&x.name.trim()}
function normalize(x){return {lat:Number(x.lat),lon:Number(x.lon),name:x.name.trim().slice(0,100)}}
function read(){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a.filter(valid).slice(0,limit).map(normalize):[]}catch{return []}}
let saved=read();
const panel=document.createElement('section');panel.className='sw-locations';panel.setAttribute('aria-label','Saved cities');
const head=document.createElement('div');head.className='sw-locations-head';
const label=document.createElement('strong');label.textContent='☆ Saved Cities';
const add=document.createElement('button');add.type='button';add.textContent='＋ Save current';
head.append(label,add);
const list=document.createElement('div');list.className='sw-location-list';
const message=document.createElement('div');message.className='sw-location-message';message.setAttribute('role','status');
panel.append(head,list,message);search.after(panel);
function same(a,b){return Math.abs(a.lat-b.lat)<.001&&Math.abs(a.lon-b.lon)<.001}
function persist(){try{localStorage.setItem(key,JSON.stringify(saved));return true}catch{message.textContent='Could not save favorites on this device.';return false}}
function render(){list.replaceChildren();const current=window.stormwatchLocation.get();if(!saved.length){const empty=document.createElement('span');empty.className='sw-location-empty';empty.textContent='No favorites yet. Save a city to switch back quickly.';list.append(empty)}
for(const city of saved){const item=document.createElement('div');item.className='sw-location-item';const active=same(city,current);if(active)item.classList.add('active');const select=document.createElement('button');select.className='sw-location-select';select.type='button';select.textContent=(active?'● ':'')+city.name;select.title='Show weather for '+city.name;select.addEventListener('click',()=>{window.stormwatchLocation.switchTo(city);message.textContent='Loading '+city.name+'…';render()});const remove=document.createElement('button');remove.className='sw-location-remove';remove.type='button';remove.textContent='×';remove.title='Remove '+city.name;remove.setAttribute('aria-label','Remove '+city.name);remove.addEventListener('click',()=>{saved=saved.filter(x=>!same(x,city));persist();render();message.textContent=city.name+' removed from favorites.'});item.append(select,remove);list.append(item)}
add.disabled=saved.length>=limit;add.textContent=saved.length>=limit?'12 city limit':'＋ Save current'}
add.addEventListener('click',()=>{const current=window.stormwatchLocation.get();if(!valid(current))return;if(saved.some(x=>same(x,current))){message.textContent='This location is already saved.';return}if(saved.length>=limit){message.textContent='Remove a city before saving another.';return}saved.unshift(normalize(current));if(persist()){render();message.textContent=current.name+' saved on this device.'}});
window.addEventListener('stormwatch:updated',render);
render();
})();