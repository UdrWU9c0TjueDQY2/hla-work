'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('src/bookingsolved/weekly-appointment-capacity-calculator/index.html','utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('const kind="capacity"'));
function setup(clipboard){
 const initial={service:'45',buffer:'15',d0:'420',d1:'420',d2:'420',d3:'420',d4:'420',d5:'0',d6:'0'},nodes={};
 const inputIds=Object.keys(initial);
 for(const id of [...inputIds,'inputs','copy','restore','week-record','status','result','detail','visual'])nodes[id]={value:initial[id]||'',textContent:'',innerHTML:'',disabled:false,listeners:{},addEventListener(type,fn){this.listeners[type]=fn},focus(){this.focused=true},select(){this.selected=true},checkValidity(){const n=Number(this.value);return this.value!==''&&Number.isInteger(n)&&n>=(id==='service'?1:0)&&n<=(id==='service'||id==='buffer'?720:1440)}};
 const context={document:{getElementById:id=>nodes[id]||null,querySelectorAll:s=>s==='input'?inputIds.map(id=>nodes[id]):[]},navigator:{clipboard},HTMLFormElement:{prototype:{reset(){Object.entries(initial).forEach(([k,v])=>nodes[k].value=v)}}},location:{href:'https://example.invalid/'}};
 vm.runInNewContext(script,context);return{n:nodes,render:()=>vm.runInNewContext('render()',context)};
}
(async()=>{
 let copied;const a=setup({writeText:async text=>{copied=text}});
 assert.match(a.n['week-record'].value,/Monday: 420 usable minutes; 7 appointments; 0 unused minutes/);
 assert.match(a.n['week-record'].value,/Sunday: 0 usable minutes; 0 appointments; 0 unused minutes/);
 assert.match(a.n['week-record'].value,/Total: 35 appointments/);
 const first=a.n['week-record'].value;a.n.d0.value='600';a.n.d1.value='240';a.render();assert.match(a.n['week-record'].value,/Total: 35 appointments/);assert.notEqual(a.n['week-record'].value,first);
 await a.n.copy.listeners.click();assert.equal(copied,a.n['week-record'].value);assert.match(copied,/Monday: 600/);assert.match(copied,/Tuesday: 240/);assert.match(copied,/including the last: 15 minutes/);
 a.n.service.value='0';a.render();assert.equal(a.n.copy.disabled,true);assert.equal(a.n['week-record'].value,'');assert.equal(a.n.status.textContent,'');
 await a.n.copy.listeners.click();assert.equal(copied.includes('Monday: 600'),true);
 a.n.restore.listeners.click();assert.equal(a.n['week-record'].value,first);
 const b=setup(undefined);await b.n.copy.listeners.click();assert.equal(b.n['week-record'].selected,true);assert.match(b.n.status.textContent,/selected/);
 let resolve;const c=setup({writeText:()=>new Promise(r=>resolve=r)});const pending=c.n.copy.listeners.click();c.n.service.value='0';c.render();resolve();await pending;assert.equal(c.n.status.textContent,'');assert.equal(c.n.copy.disabled,true);
 console.log('PASS: all daily windows retained; same-total schedules remain distinct; exact copied payload; invalid output cleared/disabled; reset; manual fallback; stale async completion guarded.');
})().catch(e=>{console.error(e);process.exitCode=1});
