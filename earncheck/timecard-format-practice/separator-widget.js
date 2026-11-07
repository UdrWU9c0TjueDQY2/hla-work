(()=>{'use strict';
function toDecimal(hours, minutes) {
  const hoursValid = Number.isInteger(hours) && hours >= 0 && hours <= 10000;
  const minutesValid = Number.isInteger(minutes) && minutes >= 0 && minutes <= 59;
  if (!hoursValid || !minutesValid || (hours === 10000 && minutes !== 0)) {
    throw Error('Use whole hours and minutes (0–59), up to 10000 hours exactly.');
  }
  return hours + minutes / 60;
}
function fromDecimal(value) {
  if (!Number.isFinite(value) || value < 0 || value > 10000) {
    throw Error('Use decimal hours from 0 to 10000.');
  }
  // The editor accepts four decimal places. Integer units keep exact half-minutes
  // from falling just below the boundary when decimal hours become binary floats.
  const units = Math.round(value * 10000);
  const total = units / 10000 === value
    ? Math.floor((units * 60 + 5000) / 10000)
    : Math.round(value * 60);
  return {hours: Math.floor(total / 60), minutes: total % 60, total};
}
if(typeof module!=='undefined')module.exports={toDecimal,fromDecimal};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);
function durationLabel(hours, minutes) {
  return hours + (hours === 1 ? ' hour ' : ' hours ') + minutes + (minutes === 1 ? ' minute' : ' minutes');
}
function forward(){ $('decimal-result').textContent='';$('decimal-detail').textContent='';$('forward-error').textContent='';try{const hs=$('whole-hours').value.trim(),ms=$('minute-part').value.trim();if(!hs||!ms)throw Error('Enter both hours and minutes.');const h=Number(hs),m=Number(ms),d=toDecimal(h,m);$('decimal-result').textContent=d.toFixed(4)+' decimal hours';$('decimal-detail').textContent=h+' + ('+m+' ÷ 60). At 2 decimal places: '+d.toFixed(2)+'. These displays are rounded; the original duration is '+durationLabel(h, m)+'.';}catch(e){$('forward-error').textContent=e.message;}}
function backward(){ $('minute-result').textContent='';$('minute-detail').textContent='';$('back-error').textContent='';try{const s=$('decimal-input').value.trim();if(!/^\d{1,5}(?:\.\d{1,4})?$/.test(s))throw Error('Use a number such as 7.45, with a dot and no more than 4 decimal places.');const n=Number(s),r=fromDecimal(n);$('minute-result').textContent=durationLabel(r.hours, r.minutes);$('minute-detail').textContent=s+' × 60 = '+(n*60).toFixed(4)+' total minutes, rounded to '+r.total+' whole minutes for this display.';}catch(e){$('back-error').textContent=e.message;}}
for(const id of ['whole-hours','minute-part'])$(id).addEventListener('input',forward);
$('decimal-input').addEventListener('input',backward);
$('reset').addEventListener('click',()=>{$('whole-hours').value='7';$('minute-part').value='45';$('decimal-input').value='7.45';forward();backward();});forward();backward();
})();
