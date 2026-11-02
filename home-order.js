/* Home ordering and progressive disclosure. */
(()=>{'use strict';
const home=document.getElementById('sw-page-home'),settings=document.querySelector('.sw60-settings');if(!home||!settings)return;
const KEY='stormwatch-home-order-v65';
const items=[{id:'rain',label:'Rain outlook',selector:'.sw58-rain'},{id:'metrics',label:'Current weather metrics',selector:'#conditionsSummary'},{id:'tiles',label:'UV, wind and daylight tiles',selector:'.sw51-bento'},{id:'agent',label:'Weather Agent',selector:'.sw58-agent-wrap'},{id:'hourly',label:'Hourly forecast',selector:'#hourlyPanel'}];
const wrappers=new Map();
for(const id of ['metrics','tiles','hourly']){
 const item=items.find(x=>x.id===id),node=home.querySelector(item.selector);if(!node)continue;
 const details=document.createElement('details');details.className='sw-home-disclosure';
 const summary=document.createElement('summary');
 const title=document.createElement('span');title.textContent=item.label;
 const hint=document.createElement('small');hint.textContent='Tap to explore';
 summary.append(title,hint);details.append(summary);node.before(details);details.append(node);
 const sync=()=>{details.hidden=node.hidden;};sync();
 new MutationObserver(sync).observe(node,{attributes:true,attributeFilter:['hidden']});
 details.addEventListener('toggle',()=>{hint.textContent=details.open?'Tap to collapse':'Tap to explore';});
 wrappers.set(id,details);
}
const agent=home.querySelector('.sw58-agent-wrap');if(agent&&agent.tagName==='DETAILS')agent.open=false;
const style=document.createElement('style');style.id='sw-home-disclosure-style';style.textContent=`
#sw-page-home .sw-home-disclosure{margin:12px 0;border:1px solid rgba(255,255,255,.16);border-radius:20px;background:rgba(18,45,78,.68);overflow:hidden;}
#sw-page-home .sw-home-disclosure[hidden]{display:none!important;}
#sw-page-home .sw-home-disclosure>summary{cursor:pointer;min-height:64px;padding:18px 16px;list-style:none;display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;}
#sw-page-home .sw-home-disclosure>summary::-webkit-details-marker{display:none;}
#sw-page-home .sw-home-disclosure>summary small{margin-left:auto;font-size:11px;font-weight:400;color:#c7dcef;}
#sw-page-home .sw-home-disclosure>summary::after{content:'+';font-size:23px;font-weight:400;}
#sw-page-home .sw-home-disclosure[open]>summary::after{content:'−';}
#sw-page-home .sw-home-disclosure>summary:focus-visible{outline:2px solid #b2e2ff;outline-offset:-4px;border-radius:18px;}
#sw-page-home .sw-home-disclosure>section{margin:0 12px 12px;}
#sw-page-home .sw-home-disclosure>#hourlyPanel h2{display:none;}
#sw-page-home .sw-home-disclosure>#conditionsSummary{width:auto;}
@media(max-width:360px){#sw-page-home .sw-home-disclosure>summary small{display:none;}}
`;document.head.append(style);
const getNode=item=>wrappers.get(item.id)||home.querySelector(item.selector);
let saved=[];try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(value))saved=value.filter(x=>items.some(item=>item.id===x))}catch{}
let order=[...new Set([...saved,...items.map(item=>item.id)])];
const section=document.createElement('section');section.className='sw65-order';section.innerHTML='<h3>Rearrange Home cards</h3><p>Use the arrow buttons to change the order of Home sections. The main current-weather card stays at the top. Tap a compact section on Home to explore its details.</p><div class="sw65-order-list"></div><button class="sw65-reset" type="button">Restore default order</button>';
settings.append(section);
const list=section.querySelector('.sw65-order-list');
function apply(){const anchor=home.querySelector('#forecastSection');if(!anchor)return;let previous=anchor;for(const id of order){const item=items.find(x=>x.id===id),node=item&&getNode(item);if(!node)continue;previous.after(node);previous=node}}
function render(){list.replaceChildren();order.forEach((id,index)=>{const item=items.find(x=>x.id===id);if(!item)return;const row=document.createElement('div');row.className='sw65-order-row';const name=document.createElement('span');name.textContent=item.label;const controls=document.createElement('div');controls.className='sw65-arrows';for(const [step,symbol,label] of [[-1,'↑','Move up'],[1,'↓','Move down']]){const button=document.createElement('button');button.type='button';button.textContent=symbol;button.setAttribute('aria-label',label+': '+item.label);button.disabled=index+step<0||index+step>=order.length;button.addEventListener('click',()=>{const next=index+step;[order[index],order[next]]=[order[next],order[index]];persist();render();apply();const focus=list.querySelectorAll('.sw65-order-row')[next]?.querySelectorAll('button')[step===-1?0:1];focus?.focus()});controls.append(button)}row.append(name,controls);list.append(row)})}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(order))}catch{}}
section.querySelector('.sw65-reset').addEventListener('click',()=>{order=items.map(x=>x.id);persist();render();apply()});
render();apply();
})();
