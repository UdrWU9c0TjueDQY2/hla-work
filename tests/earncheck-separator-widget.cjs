const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const file=process.argv[2]||require('node:path').join(__dirname,'../src/earncheck/timecard-format-practice/separator-widget.js');
const ids=['whole-hours','minute-part','decimal-input','decimal-result','decimal-detail','forward-error','minute-result','minute-detail','back-error','reset'];
const e=Object.fromEntries(ids.map(id=>[id,{value:'',textContent:'',events:{},addEventListener(n,f){this.events[n]=f}}]));
e['whole-hours'].value='7';e['minute-part'].value='45';e['decimal-input'].value='7.45';
const ctx={module:{exports:{}},document:{getElementById:id=>e[id]}};vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);const {toDecimal,fromDecimal}=ctx.module.exports;
assert.match(e['decimal-result'].textContent,/7\.7500/);assert.match(e['minute-result'].textContent,/7 hours 27 minutes/);
assert.equal(toDecimal(0,0),0);assert.equal(toDecimal(8,15),8.25);assert.equal(toDecimal(0,59),59/60);assert.equal(fromDecimal(7.9999).hours,8);assert.equal(fromDecimal(7.9999).minutes,0);assert.equal(fromDecimal(.025).total,2);
for(const [h,m] of [[-1,0],[1.5,0],[1,60],[1,-1],[10000,0],[0,NaN]])assert.throws(()=>toDecimal(h,m));
for(const bad of [-1,Infinity,10001,NaN])assert.throws(()=>fromDecimal(bad));
e['minute-part'].value='';e['minute-part'].events.input();assert.equal(e['decimal-result'].textContent,'');assert.match(e['forward-error'].textContent,/both/);
for(const bad of ['', '7,45','7.45000','1e3','-2','10000.0001']){e['decimal-input'].value=bad;e['decimal-input'].events.input();assert.equal(e['minute-result'].textContent,'');assert.ok(e['back-error'].textContent);}
e.reset.events.click();assert.match(e['decimal-result'].textContent,/7\.7500/);assert.match(e['minute-result'].textContent,/7 hours 27 minutes/);assert.equal(e['forward-error'].textContent,'');assert.equal(e['back-error'].textContent,'');
console.log('Separator widget: default, zero, fractional minute rounding, carry, bounds, stale-result, lexical validation and reset passed.');
