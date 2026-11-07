'use strict';
function decimal(raw,label,optional=false){const s=raw.trim();if(s===''&&optional)return null;if(!/^\d+(\.\d{1,2})?$/.test(s))throw Error(label+': enter a non-negative decimal with up to two places.');const [a,b='']=s.split('.'),n=BigInt(a)*100n+BigInt(b.padEnd(2,'0'));if(n>10000000n)throw Error(label+': maximum is 100,000.');return n;}
function calculate(areas,coverage,allowance,price){const parts=areas.map((x,i)=>decimal(x,'Room area '+(i+1),true)),total=parts.reduce((s,x)=>s+(x??0n),0n),box=decimal(coverage,'Coverage'),pct=decimal(allowance,'Allowance'),cost=decimal(price,'Price',true);if(total<=0n)throw Error('Enter a positive combined room area.');if(box<=0n)throw Error('Coverage per box must be greater than zero.');if(pct>10000n)throw Error('Allowance must be between 0 and 100%.');const numerator=total*(10000n+pct),denominator=10000n*box,boxes=(numerator+denominator-1n)/denominator;return{total,box,pct,boxes,purchased:boxes*box,targetNumerator:numerator,cost:cost===null?null:cost*boxes};}
function fixed(n,places=2){const s=n.toString().padStart(places+1,'0');return s.slice(0,-places)+'.'+s.slice(-places);}
if(typeof module!=='undefined')module.exports={calculate,decimal,fixed};
if(typeof document!=='undefined'){
  const el=id=>document.getElementById(id),ids=['a1','a2','a3','coverage','allowance','price'];
  function clearResult(){el('result').hidden=true;el('record').value='';el('status').textContent='';}
  function recordText(){return el('record').value.trim();}
  function selectRecord(message){
    const record=el('record');
    if(!recordText()){el('status').textContent='Calculate a current record first.';return;}
    record.focus();
    record.select();
    el('status').textContent=message;
  }
  async function copyRecord(){
    const text=recordText();
    if(!text){el('status').textContent='Calculate a current record first.';return;}
    try{
      if(!navigator.clipboard||typeof navigator.clipboard.writeText!=='function')throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      el('status').textContent='Calculation record copied. Paste it where you keep quote notes.';
    }catch(error){
      selectRecord('Copy was unavailable. The complete record is selected for manual copying.');
    }
  }
  function saveRecord(){
    const text=recordText();
    if(!text){el('status').textContent='Calculate a current record first.';return;}
    try{
      if(typeof Blob!=='function'||!URL||typeof URL.createObjectURL!=='function')throw Error('Download unavailable');
      const href=URL.createObjectURL(new Blob([text+'\n'],{type:'text/plain;charset=utf-8'}));
      const link=document.createElement('a');
      link.href=href;
      link.download='scopebid-flooring-box-record.txt';
      link.hidden=true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(()=>URL.revokeObjectURL(href),0);
      el('status').textContent='Local text file prepared. Check your browser downloads.';
    }catch(error){
      selectRecord('Save was unavailable. The complete record is selected for manual copying.');
    }
  }
  el('calculate').addEventListener('click',()=>{
    clearResult();
    try{
      const r=calculate(['a1','a2','a3'].map(id=>el(id).value),el('coverage').value,el('allowance').value,el('price').value),unit=el('unit').value;
      el('boxes').textContent=r.boxes.toString();
      el('purchased').textContent=fixed(r.purchased);
      el('coverage-unit').textContent=unit+' purchased coverage';
      el('record').value='Measured area: '+fixed(r.total)+' '+unit+'\nChosen allowance: '+fixed(r.pct)+'%\nTarget with allowance: '+fixed(r.targetNumerator,6)+' '+unit+'\nCoverage per box: '+fixed(r.box)+' '+unit+'\nWhole boxes: '+r.boxes+'\nPurchased coverage: '+fixed(r.purchased)+' '+unit+'\nPurchased minus measured: '+fixed(r.purchased-r.total)+' '+unit+'\nMaterials subtotal: '+(r.cost===null?'not entered':fixed(r.cost)+' (your entered currency)')+'\nExcludes labour, delivery, tax and other materials. Confirm measurements and layout.';
      el('result').hidden=false;
      el('status').textContent='Calculated using your inputs. Review the assumptions before quoting.';
    }catch(e){el('status').textContent=e.message;}
  });
  el('copy-record').addEventListener('click',copyRecord);
  el('save-record').addEventListener('click',saveRecord);
  for(const id of ids)el(id).addEventListener('input',clearResult);
  el('unit').addEventListener('change',clearResult);
  el('clear').addEventListener('click',()=>{ids.forEach(id=>el(id).value='');clearResult();});
  el('example').addEventListener('click',()=>{['80','20','','22','10','49.99'].forEach((x,i)=>el(ids[i]).value=x);el('unit').value='sq ft';clearResult();});
}
