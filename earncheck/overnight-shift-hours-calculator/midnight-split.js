(() => {
  const form = document.getElementById('midnight-form');
  const byId = id => document.getElementById(id);
  const midnight = 24 * 60;
  const minutes = value => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
    const [hours, mins] = value.split(':').map(Number);
    return hours * 60 + mins;
  };
  const fmt = amount => Math.floor(amount / 60) + 'h ' + String(amount % 60).padStart(2,'0') + 'm';
  function split(start, end, breakTime, length) {
    if (start === null || end === null) throw Error('Enter both shift times.');
    if (start === 0 || end > start) throw Error('Use a start before midnight and an end the next day, no more than 24 hours later.');
    const endOnTimeline = midnight + end;
    if (!Number.isInteger(length) || length < 0 || length > 1440) throw Error('Enter a break length in whole minutes from 0 to 1,440.');
    let firstBreak = 0;
    if (length) {
      if (breakTime === null) throw Error('Enter the start of the break or set its length to zero.');
      const begins = breakTime < start ? midnight + breakTime : breakTime;
      if (begins < start || begins + length > endOnTimeline) throw Error('The entire break must fall inside the shift.');
      firstBreak = Math.max(0, Math.min(begins + length, midnight) - begins);
    }
    const firstGross = midnight - start, secondGross = end;
    return {firstGross, secondGross, firstBreak, secondBreak:length-firstBreak, firstNet:firstGross-firstBreak, secondNet:secondGross-(length-firstBreak)};
  }
  function update(){
    const raw = byId('mid-break-length').value;
    const length = raw.trim() === '' ? NaN : Number(raw);
    byId('mid-break-start').disabled = length === 0;
    try {
      const r = split(minutes(byId('mid-start').value),minutes(byId('mid-end').value),minutes(byId('mid-break-start').value),length);
      for (const [id,value] of Object.entries(r)) byId('mid-'+id).textContent=fmt(value);
      byId('mid-total').textContent=fmt(r.firstNet+r.secondNet);
      byId('mid-error').textContent='';
      byId('mid-result').hidden=false;
    } catch(err) {
      byId('mid-result').hidden=true;
      byId('mid-error').textContent=err.message;
    }
  }
  form.addEventListener('input',update);
  form.addEventListener('submit',e=>{e.preventDefault();update();});
  byId('mid-example').addEventListener('click',()=>{form.reset();update();});
  update();
})();
