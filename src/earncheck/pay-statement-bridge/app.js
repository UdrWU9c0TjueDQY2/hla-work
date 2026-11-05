import {reconcile,amount,validAmount} from './model.js?v=3';
const form=document.querySelector('form'), fields=[...form.querySelectorAll('input')], output=document.querySelector('#result'), error=document.querySelector('#error');
function clear(){output.hidden=true;error.textContent='';document.querySelector('#print').disabled=true;}
form.addEventListener('input',clear);
form.addEventListener('submit',event=>{event.preventDefault();clear();try{
const r=reconcile(fields.map(x=>x.value));
for(const key of ['gross','deductions','additions','net','expected','difference']) document.querySelector('[data-value="'+key+'"]').textContent=amount(r[key]);
document.querySelector('#verdict').textContent=r.difference===0?'The entered amounts balance.':'There is a difference to review.';
document.querySelector('#explain').textContent=r.difference===0?'The calculated amount equals the stated net amount. This checks the arithmetic, not whether every line on your statement is correct.':`The stated net amount is ${amount(Math.abs(r.difference))} ${r.difference>0?'higher':'lower'} than the calculated amount. Check dates, categories and any omitted adjustments before drawing a conclusion.`;
const max=Math.max(r.gross,r.deductions,r.additions,Math.abs(r.expected),1);
for(const key of ['gross','deductions','additions','expected'])document.querySelector('[data-bar="'+key+'"]').style.width=Math.max(0,Math.abs(r[key])/max*100)+'%';
output.hidden=false;document.querySelector('#print').disabled=false;output.focus();
}catch(e){error.textContent=e.message; const invalid=fields.find(x=>!validAmount(x.value));invalid?.focus();}});
document.querySelector('#example').addEventListener('click',()=>{['1500','310','45','1235'].forEach((x,i)=>fields[i].value=x);form.requestSubmit();});
document.querySelector('#reset').addEventListener('click',()=>{fields.forEach(field=>field.value='');clear();fields[0].focus();});
document.querySelector('#print').addEventListener('click',()=>window.print());
