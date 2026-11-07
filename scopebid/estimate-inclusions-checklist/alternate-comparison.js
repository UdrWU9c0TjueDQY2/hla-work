(() => {
  const get=id=>document.getElementById('alt-'+id);
  const form=get('form');
  function cents(id,label){
    const raw=get(id).value.trim();
    if(!/^(?:(?:\d{1,3}(?:,\d{3})+)|\d+)(?:\.\d{1,2})?$/.test(raw)) throw Error('Enter '+label+' as a nonnegative amount with up to two decimal places. Use 0 for none.');
    const [whole,fraction='']=raw.replace(/,/g,'').split('.');
    const value=Number(whole)*100+Number(fraction.padEnd(2,'0'));
    if (!Number.isSafeInteger(value)||value>99999999999) throw Error('Keep each amount at or below 999,999,999.99.');
    return value;
  }
  function update(){
    try{
      const base=cents('base','the base quote'),replaced=cents('remove','the included amount replaced');
      if(replaced>base) throw Error('The amount replaced must be part of the base quote and cannot exceed it.');
      const keep=base-replaced;
      const a=keep+cents('item-a','Option A replacement')+cents('extra-a','Option A extra work');
      const b=keep+cents('item-b','Option B replacement')+cents('extra-b','Option B extra work');
      const formatter=new Intl.NumberFormat(undefined,{style:'currency',currency:get('currency').value});
      const money=v=>formatter.format(v/100);
      const change=v=>v===base?'Same as base':(v>base?'Add ':'Deduct ')+money(Math.abs(v-base));
      for(const [id,text] of [['keep',money(keep)],['base-out',money(base)],['a-out',money(a)],['b-out',money(b)],['a-diff',change(a)],['b-diff',change(b)]]) get(id).textContent=text;
      get('error').textContent='';get('result').hidden=false;
    }catch(err){get('result').hidden=true;get('error').textContent=err.message;}
  }
  form.addEventListener('input',update);form.addEventListener('change',update);form.addEventListener('submit',e=>{e.preventDefault();update()});
  get('reset').onclick=()=>{form.reset();update()};update();
})();
