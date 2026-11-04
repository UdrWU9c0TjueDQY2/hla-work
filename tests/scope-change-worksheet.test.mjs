import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildNote} from '../src/scopebid/scope-change-worksheet/model.mjs';
assert.equal(buildNote(['name','','','','']).count,0);
assert.equal(buildNote(['',' add ','',' keep ','']).count,2);
assert.equal((buildNote(['','','','','']).text.match(/Not recorded/g)||[]).length,4);
assert.ok(buildNote(['x','<b>literal</b>','','','']).text.includes('<b>literal</b>'));
const els=Object.fromEntries(['job','added','removed','kept','open','note','progress','copy','status','example','clear'].map(id=>[id,{value:'',textContent:'',handlers:{},addEventListener(k,f){this.handlers[k]=f;},focus(){},select(){this.selected=true;}}]));
const document={getElementById:id=>els[id]};let copied='';const navigator={clipboard:{async writeText(v){copied=v;}}};
const js=readFileSync(new URL('../src/scopebid/scope-change-worksheet/app.js',import.meta.url),'utf8').replace("import {buildNote} from '../src/scopebid/scope-change-worksheet/model.mjs';",'');
new Function('document','navigator','buildNote',js)(document,navigator,buildNote);
assert.equal(els.copy.disabled,true);els.example.handlers.click();assert.equal(els.progress.textContent,'4 of 4 categories filled');assert.equal(els.copy.disabled,false);
await els.copy.handlers.click();assert.equal(copied,els.note.value);assert.ok(copied.includes('Do not paint the ceiling.'));
els.added.value='New task';els.added.handlers.input();assert.ok(els.note.value.includes('New task'));assert.equal(els.status.textContent,'');
els.clear.handlers.click();assert.equal(els.copy.disabled,true);assert.equal(els.progress.textContent,'0 of 4 categories filled');
navigator.clipboard.writeText=async()=>{throw Error('unavailable');};els.example.handlers.click();await els.copy.handlers.click();assert.equal(els.note.selected,true);assert.ok(els.status.textContent.includes('selected'));
const html=readFileSync(new URL('../src/scopebid/scope-change-worksheet/index.html',import.meta.url),'utf8');assert.ok(html.includes('id6796729890'));assert.ok(html.includes('rel="canonical"'));assert.ok(html.includes('first three quotes'));assert.ok(html.includes('Publisher disclosure'));
console.log('PASS model, empty guard, example, live edit, copy, copy fallback, clear, metadata and disclosure checks');

