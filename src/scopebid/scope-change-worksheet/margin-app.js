import {calculate,money,record} from './margin-model.mjs';
const root = document.querySelector('[data-margin-tool]');
const form = root.querySelector('form');
const inputs = [...form.querySelectorAll('input')];
const results = root.querySelector('[data-results]');
const error = root.querySelector('[data-error]');
const text = root.querySelector('[data-record]');
const save = root.querySelector('[data-save]');
const tbody = root.querySelector('tbody');
function update() {
  text.value=''; save.disabled=true; results.hidden=true; tbody.replaceChildren();
  try {
    const r=calculate(inputs.map(x=>x.value));
    for(const [label,row] of [['Original job',r.original],['Revised at offered price',r.proposed],['Revised at comparison price',r.matched]]) {
      if(!row) continue;
      const tr=document.createElement('tr');
      for(const [i,value] of [label,money(row.price),money(row.profit),row.margin.toFixed(2)+'%'].entries()) {
        const cell=document.createElement(i===0?'th':'td'); if(i===0) cell.scope='row'; cell.textContent=value; tr.append(cell);
      }
      tbody.append(tr);
    }
    root.querySelector('[data-insight]').textContent=`The offered extra work adds ${money(r.extraProfit)} gross profit. Whole-job margin changes by ${r.percentagePoints>=0?'+':''}${r.percentagePoints.toFixed(2)} percentage points.`;
    root.querySelector('[data-comparison]').textContent=r.keepExtra===null?'An original direct cost of zero gives a 100% original margin. The comparison is not calculated in that case. If extra direct cost is also zero, the revised job retains a 100% gross margin.':`Comparison extra price: ${money(r.keepExtra)}. This keeps at least the original ${r.original.margin.toFixed(2)}% gross margin after rounding up to a cent. It is a mathematical comparison, not a recommended or approved price.`;
    text.value=record(r); error.textContent=''; results.hidden=false; save.disabled=false;
  } catch(e) {error.textContent=e.message;}
}
form.addEventListener('submit',e=>{e.preventDefault();update();});
inputs.forEach(x=>x.addEventListener('input',update));
root.querySelector('[data-example]').addEventListener('click',()=>{['3200','2080','480','420'].forEach((v,i)=>inputs[i].value=v);update();});
save.addEventListener('click',()=>{
  if(save.disabled||!text.value)return;
  const url=URL.createObjectURL(new Blob([text.value+'\n'],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='extra-work-margin-comparison.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
update();
