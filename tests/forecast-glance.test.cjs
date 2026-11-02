const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('forecast-glance.js','utf8');
function element(){return {children:[],textContent:'',className:'',innerHTML:'',append(...items){this.children.push(...items)},prepend(...items){this.children.unshift(...items)},replaceChildren(...items){this.children=[...items]},querySelector(s){return this.parts?.[s]},};}
const panel=element(),section=element();
section.parts=Object.fromEntries(['.su42-status','.su42-cards','.su42-hours'].map(s=>[s,element()]));
const listeners={};
const context={document:{getElementById:id=>id==='dailyPanel'?panel:null,createElement:()=>element()},window:{addEventListener:(name,cb)=>listeners[name]=cb},console};
context.document.createElement=()=>{const e=element();e.querySelector=s=>e.parts?.[s]||section.parts[s];return e};
vm.runInNewContext(source,context,{filename:'forecast-glance.js'});
const update=weather=>listeners['stormwatch:updated']({detail:{weather}});
function forecast({chances,amounts,temps,time='2026-11-02T08:00'}){
const n=Math.max(chances?.length||0,amounts?.length||0,temps?.length||0,12);
return {current:{time},hourly:{time:Array.from({length:n},(_,i)=>'2026-11-02T'+String(8+i).padStart(2,'0')+':00'),precipitation_probability:chances,precipitation:amounts,temperature_2m:temps}}}
function values(){return section.parts['.su42-cards'].children.map(x=>x.children[1].textContent)}
const all=n=>Array(12).fill(n);
update(forecast({chances:all(0),amounts:all(0),temps:all(60)}));
assert.equal(values()[0],'Not indicated');assert.equal(values()[2],'0.00 in');
update(forecast({chances:[10,20,75,...all(10)],amounts:[0,0,.25,...all(0)],temps:Array.from({length:12},(_,i)=>60+i)}));
assert.equal(values()[0],'10 AM');assert.equal(values()[1],'75%');assert.equal(values()[2],'0.25 in');assert.equal(values()[3],'+11°F');
update(forecast({chances:all(10),amounts:[0,.02,...all(0)],temps:all(60)}));
assert.equal(values()[0],'9 AM');
update(forecast({chances:all(0),amounts:[0,null,...all(0)],temps:all(60)}));
assert.equal(values()[2],'—');
update({current:{time:'2026-11-02T08:00'},hourly:{time:[]}});
assert.equal(section.parts['.su42-cards'].children.length,0);
assert.match(section.parts['.su42-status'].textContent,/unavailable/);
update(forecast({chances:all(0),amounts:all(0),temps:[60,null,...all(60)]}));
assert.equal(values()[3],'0°F');
console.log('Forecast tests passed: dry, heavy rain, amount threshold, missing amounts, location change, temperatures');
