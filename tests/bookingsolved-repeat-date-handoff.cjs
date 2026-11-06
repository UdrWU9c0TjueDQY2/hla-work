'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'src/bookingsolved/weekly-appointment-capacity-calculator/repeat-dates.html','utf8');
const script=source.match(/<script>([\s\S]*?)<\/script>/)[1];
const initial={first:'2026-11-06',interval:'14',count:'4',skip:''};
function setup(clipboard){
 const nodes={};for(const id of ['inputs','first','interval','count','skip','out','notes','dates','summary','copy','copy-status','reset','print']){
  const n=nodes[id]={value:initial[id]||'',textContent:'',children:[],disabled:false,focus(){this.focused=true},select(){this.selected=true},append(x){this.children.push(x)},replaceChildren(...items){this.children=items;if(id==='skip')this.value=(items.find(x=>x.selected)||items[0])?.value||'';}};
  Object.defineProperty(n,'valueAsNumber',{get(){return id==='first'?Date.parse(this.value+'T00:00:00Z'):Number(this.value)}});
 }
 nodes.inputs.checkValidity=()=>/^\d{4}-\d\d-\d\d$/.test(nodes.first.value)&&nodes.first.value>='1900-01-01'&&nodes.first.value<='2099-12-31'&&Number.isInteger(nodes.count.valueAsNumber)&&nodes.count.valueAsNumber>=1&&nodes.count.valueAsNumber<=24;
 nodes.inputs.reset=()=>Object.entries(initial).forEach(([id,v])=>nodes[id].value=v);
 let prints=0;
 const context={document:{getElementById:id=>nodes[id],createElement:()=>({textContent:''})},navigator:{clipboard},Option:function(text,value,_default,selected){Object.assign(this,{text,value,selected})},window:{print(){prints++}}};
 vm.runInNewContext(script,context);return{n:nodes,render:()=>vm.runInNewContext('render()',context),prints:()=>prints};
}
(async()=>{
 const a=setup({writeText:async()=>{}});assert.match(a.n.summary.value,/NOT CONFIRMED/);assert.match(a.n.summary.value,/Dec 18, 2026/);assert.equal(a.n.copy.disabled,false);
 a.n.skip.value='2026-11-20';a.render();assert.match(a.n.summary.value,/Nov 20, 2026 — skipped/);assert.match(a.n.summary.value,/3 proposed appointments/);assert.match(a.n.summary.value,/Dec 18, 2026/);
 a.n.count.value='0';a.render();assert.equal(a.n.summary.value,'');assert.equal(a.n.copy.disabled,true);assert.equal(a.n.print.disabled,true);a.n.print.onclick();assert.equal(a.prints(),0);
 a.n.reset.onclick();assert.match(a.n.summary.value,/4 proposed appointments/);assert.equal(a.n.skip.value,'');
 a.n.first.value='2028-02-29';a.n.count.value='2';a.render();assert.match(a.n.summary.value,/Mar 14, 2028/);
 a.n.first.value='2099-12-31';a.render();assert.match(a.n.out.textContent,/2099/);assert.equal(a.n.summary.value,'');
 const b=setup(undefined);await b.n.copy.onclick();assert.equal(b.n.summary.selected,true);assert.match(b.n['copy-status'].textContent,/device/);
 let resolve;const c=setup({writeText:()=>new Promise(r=>resolve=r)});const pending=c.n.copy.onclick();c.n.count.value='0';c.render();resolve();await pending;assert.equal(c.n['copy-status'].textContent,'');
 assert.match(source,/@media print\{[^}]*\.portable\{display:none\}/);assert.match(source,/\.store-url\{display:block/);assert.ok(!source.includes('@media print{a,button{display:none}'));
 assert.match(source,/<p class="store-url">https:\/\/apps.apple.com\/us\/app\/bookingsolved-client-booking\/id6800187784<\/p>/);
 console.log('PASS: valid summary, skip cadence, invalid-state clearing, reset, leap date, upper-year bound, manual copy fallback, stale async copy, printable destination.');
})().catch(e=>{console.error(e);process.exitCode=1});
