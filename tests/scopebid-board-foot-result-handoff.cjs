'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const sourcePath=process.argv[2]||path.join(__dirname,'..','src','scopebid','board-foot-quote-check','app.js');
const source=fs.readFileSync(sourcePath,'utf8');
const {compute}=require(sourcePath);
assert.equal(compute(1,6,8,12,10,7.5).boards,14);
assert.equal(compute(1,6,8,12,10,7.5).cost,420);
assert.equal(compute(1,6,8,12,10.01,7.5),null);
assert.equal(compute(1,6,8,12.5,10,7.5),null);
assert.equal(compute(0,6,8,12,10,7.5),null);
function element(value=''){
  return{value:String(value),textContent:'',hidden:false,disabled:false,selected:false,listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},focus(){this.focused=true;},select(){this.selected=true;}};
}
const initial={thickness:1,width:6,length:8,quantity:12,extra:10,price:7.5,currency:'CAD',basis:'supplier'};
const elements={};
for(const [id,value] of Object.entries(initial))elements[id]=element(value);
for(const id of ['output','note','error','copy-status','copy-note','calculate','reset','each','count','cost','result'])if(!elements[id])elements[id]=element();
elements.output.hidden=true;elements.copyNote=elements['copy-note'];
const document={getElementById:id=>elements[id],execCommand:()=>true};
let copied='';
const sandbox={document,navigator:{clipboard:{writeText:async text=>{copied=text;}}},console,Intl,Number,Math,module:undefined};
vm.runInNewContext(source,sandbox);
elements.calculate.listeners.click();
assert.equal(elements.output.hidden,false);
assert.equal(elements['copy-note'].disabled,false);
assert.match(elements.note.value,/LUMBER MATERIAL NOTE/);
assert.equal(elements.count.textContent,'14');
assert.match(elements.note.value,/No automatic transfer to ScopeBid/);
Promise.resolve(elements['copy-note'].listeners.click()).then(()=>{
  assert.equal(copied,elements.note.value);
  assert.match(elements['copy-status'].textContent,/copied/i);
  elements.price.value='8';
  elements.price.listeners.input();
  assert.equal(elements.output.hidden,true);
  assert.equal(elements.note.value,'');
  assert.equal(elements['copy-note'].disabled,true);
  assert.equal(elements['copy-status'].textContent,'');
  elements['copy-note'].disabled=false;
  return elements['copy-note'].listeners.click();
}).then(()=>{
  assert.match(elements['copy-status'].textContent,/Calculate a valid/i);
  assert.equal(elements['copy-note'].disabled,true);
  console.log('scopebid board-foot result handoff: 15 checks passed');
}).catch(error=>{console.error(error);process.exitCode=1;});
