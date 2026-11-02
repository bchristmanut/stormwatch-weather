const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function el(){return {children:[],textContent:'',value:'',listeners:{},append(...x){this.children.push(...x)},addEventListener(k,f){this.listeners[k]=f},setAttribute(){},};}
const agent=el(),events={};const context={document:{getElementById:()=>agent,createElement:el},window:{addEventListener:(k,f)=>events[k]=f},Date,console};
vm.runInNewContext(fs.readFileSync('weather-agent-chat.js','utf8'),context);
const wrap=agent.children[0],choices=wrap.children[1],form=wrap.children[2],response=wrap.children[3],input=form.children[0];
function ask(q){input.value=q;form.listeners.submit({preventDefault(){}});return response.textContent}
function weather(now){const times=[],p=[],a=[],temp=[],wind=[],code=[];for(let i=0;i<72;i++){const d=new Date('2026-11-02T00:00:00Z');d.setUTCHours(i);times.push(d.toISOString().slice(0,16));p.push(i===19?85:10);a.push(i===19?.3:0);temp.push(55+i/10);wind.push(8);code.push(0)}return {current:{time:now},hourly:{time:times,precipitation_probability:p,precipitation:a,temperature_2m:temp,wind_speed_10m:wind,weather_code:code}}}
events['stormwatch:updated']({detail:{weather:weather('2026-11-02T12:00')}});
assert.match(ask('Will it rain this afternoon?'),/No strong precipitation/);
assert.match(ask('Tell me a joke'),/I can help with rain/);
assert.match(ask('What about tonight?'),/7 PM/);
assert.match(ask('How much rain tomorrow?'),/0.00 inches/);
assert.match(ask('What about tonight?'),/0.30 inches/);
events['stormwatch:updated']({detail:{weather:weather('2026-11-02T23:00')}});
assert.match(ask('What about tonight?'),/0.00 inches/);
events['stormwatch:updated']({detail:{weather:{current:{time:'2026-11-02T12:00'},hourly:{time:[]}}}});
assert.match(ask('How much rain tomorrow?'),/not available/);
console.log('Weather Agent time and follow-up scenarios passed');
