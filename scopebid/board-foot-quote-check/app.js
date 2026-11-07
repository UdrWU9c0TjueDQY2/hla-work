'use strict';
function compute(t,w,l,q,a,p){
  if(![t,w,l,q,a,p].every(Number.isFinite)||t<.01||t>24||w<.01||w>100||l<.01||l>100||!Number.isInteger(q)||q<1||q>10000||a<0||a>100||Math.abs(a*10-Math.round(a*10))>1e-8||p<0||p>10000)return null;
  const each=t*w*l/12,boards=Math.ceil(q*(1000+Math.round(a*10))/1000),total=each*boards;
  return{each,boards,total,base:each*q,linear:l*boards,cubic:total/12,cost:total*p,extra:(boards/q-1)*100};
}
const fmt=n=>n.toLocaleString('en-US',{maximumFractionDigits:4});
if(typeof module!=='undefined')module.exports={compute,fmt};
if(typeof document!=='undefined'){
  const $=id=>document.getElementById(id);
  const fields=['thickness','width','length','quantity','extra','price'];
  function clear(){
    $('output').hidden=true;
    $('note').value='';
    $('error').textContent='';
    $('copy-status').textContent='';
    $('copy-note').disabled=true;
  }
  function calculate(){
    clear();
    const raw=fields.map(id=>$(id).value.trim());
    const r=raw.some(v=>v==='')?null:compute(...raw.map(Number));
    const basis=$('basis').value;
    if(!r){
      $('error').textContent='Enter valid numbers: thickness 0.01–24 in, width 0.01–100 in, length 0.01–100 ft, 1–10,000 whole boards, allowance 0–100% with at most one decimal, and price 0–10,000.';
      return;
    }
    if(!basis){
      $('error').textContent='Choose whether the dimensions are confirmed, measured or assumed.';
      return;
    }
    const money=$('currency').value+' '+r.cost.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    $('each').textContent=fmt(r.each)+' BF';
    $('count').textContent=fmt(r.boards);
    $('cost').textContent=money;
    const basisText={supplier:'Supplier billing dimensions confirmed by user.',measured:'Measured dimensions: volume estimate, not a confirmed supplier bill.',assumed:'Assumed dimensions: confirm sizing and billing before relying on price.'}[basis];
    const text='Base quantity: '+raw[3]+' boards / '+fmt(r.base)+' BF.\nChosen allowance: '+raw[4]+'%. Whole-board rounding adds '+fmt(r.extra)+'% in practice.\nTotal: '+fmt(r.total)+' BF; '+fmt(r.linear)+' linear feet; '+fmt(r.cubic)+' cubic feet.\n'+basisText;
    $('result').textContent=text;
    $('note').value='LUMBER MATERIAL NOTE\nEntered dimensions: '+raw[0]+' in × '+raw[1]+' in × '+raw[2]+' ft.\n'+text+'\nEntered rate: '+$('currency').value+' '+raw[5]+' per BF.\nModeled material subtotal: '+money+'.\nExcludes labor, delivery, tax and supplier-specific adjustments. No automatic transfer to ScopeBid.';
    $('output').hidden=false;
    $('copy-note').disabled=false;
  }
  async function copyNote(){
    const note=$('note');
    const status=$('copy-status');
    if($('output').hidden||!note.value){
      status.textContent='Calculate a valid material batch before copying.';
      $('copy-note').disabled=true;
      return;
    }
    try{
      if(typeof navigator!=='undefined'&&navigator.clipboard&&navigator.clipboard.writeText){
        await navigator.clipboard.writeText(note.value);
      }else{
        note.focus();
        note.select();
        if(!document.execCommand||!document.execCommand('copy'))throw new Error('copy unavailable');
      }
      status.textContent='Material note copied. Paste it where you keep the quote assumptions.';
    }catch{
      note.focus();
      note.select();
      status.textContent='Automatic copy was unavailable. The note is selected so you can copy it manually.';
    }
  }
  $('calculate').addEventListener('click',calculate);
  [...fields,'currency','basis'].forEach(id=>$(id).addEventListener('input',clear));
  $('copy-note').addEventListener('click',copyNote);
  $('reset').addEventListener('click',()=>{
    [1,6,8,12,10,7.5].forEach((v,i)=>$(fields[i]).value=String(v));
    $('currency').value='CAD';
    $('basis').value='';
    clear();
  });
}
