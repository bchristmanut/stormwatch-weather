/* StormWatch v65: accessible Home card ordering, stored on this device. */
(()=>{'use strict';
const home=document.getElementById('sw-page-home'),settings=document.querySelector('.sw60-settings');if(!home||!settings)return;
const KEY='stormwatch-home-order-v65';
const items=[{id:'rain',label:'Rain outlook',selector:'.sw58-rain'},{id:'metrics',label:'Current weather metrics',selector:'#conditionsSummary'},{id:'tiles',label:'UV, wind and daylight tiles',selector:'.sw51-bento'},{id:'agent',label:'Weather Agent',selector:'.sw58-agent-wrap'},{id:'hourly',label:'Hourly forecast',selector:'#hourlyPanel'}];
const getNode=item=>home.querySelector(item.selector);
let saved=[];try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(value))saved=value.filter(x=>items.some(item=>item.id===x))}catch{}
let order=[...new Set([...saved,...items.map(item=>item.id)])];
const section=document.createElement('section');section.className='sw65-order';section.innerHTML='<h3>Rearrange Home cards</h3><p>Use the arrow buttons to change the order of Home sections. The main current-weather card stays at the top.</p><div class="sw65-order-list"></div><button class="sw65-reset" type="button">Restore default order</button>';
settings.append(section);
const list=section.querySelector('.sw65-order-list');
function apply(){const anchor=home.querySelector('#forecastSection');if(!anchor)return;let previous=anchor;for(const id of order){const item=items.find(x=>x.id===id),node=item&&getNode(item);if(!node)continue;previous.after(node);previous=node}}
function render(){list.replaceChildren();order.forEach((id,index)=>{const item=items.find(x=>x.id===id);if(!item)return;const row=document.createElement('div');row.className='sw65-order-row';const name=document.createElement('span');name.textContent=item.label;const controls=document.createElement('div');controls.className='sw65-arrows';for(const [step,symbol,label] of [[-1,'↑','Move up'],[1,'↓','Move down']]){const button=document.createElement('button');button.type='button';button.textContent=symbol;button.setAttribute('aria-label',label+': '+item.label);button.disabled=index+step<0||index+step>=order.length;button.addEventListener('click',()=>{const next=index+step;[order[index],order[next]]=[order[next],order[index]];persist();render();apply();const focus=list.querySelectorAll('.sw65-order-row')[next]?.querySelectorAll('button')[step===-1?0:1];focus?.focus()});controls.append(button)}row.append(name,controls);list.append(row)})}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(order))}catch{}}
section.querySelector('.sw65-reset').addEventListener('click',()=>{order=items.map(x=>x.id);persist();render();apply()});
render();apply();
})();