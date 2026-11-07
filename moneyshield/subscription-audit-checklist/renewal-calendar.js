(() => {
  const get = id => document.getElementById('renew-'+id);
  const day = 86400000;
  let plan;
  function date(value,label) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value<'0001-01-01') throw Error('Enter a valid '+label+'.');
    const time=Date.parse(value+'T00:00:00Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0,10)!==value) throw Error('Enter a valid '+label+'.');
    return time;
  }
  function days(text,label,max){
    if (!/^\d+$/.test(text) || Number(text)>max) throw Error('Enter whole '+label+' from 0 to '+max+'.');
    return Number(text);
  }
  function stamp(time) {
    const iso=new Date(time).toISOString();
    if (!/^\d{4}-/.test(iso) || iso.startsWith('0000-')) throw Error('Choose dates inside the supported four-digit calendar years.');
    return iso.slice(0,10);
  }
  const display = time => new Intl.DateTimeFormat('en',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(time);
  function update(){
    const exact=get('mode').value==='exact';
    get('exact-group').hidden=!exact;get('notice-group').hidden=exact;
    get('exact').disabled=!exact;get('notice').disabled=exact;
    plan=null;
    try {
      const renewal=date(get('date').value,'renewal date');
      const cutoff=exact?date(get('exact').value,'provider cutoff date'):renewal-days(get('notice').value,'notice days',3660)*day;
      if (cutoff>renewal) throw Error('The cutoff cannot be after the renewal. Recheck both dates.');
      const review=cutoff-days(get('lead').value,'review days',3660)*day;
      for(const time of [review,review+day,cutoff,renewal])stamp(time);
      for(const [id,time] of [['review-out',review],['cutoff-out',cutoff],['date-out',renewal]])get(id).textContent=display(time);
      plan={review,cutoff,renewal};get('error').textContent='';get('result').hidden=false;get('download').disabled=false;
    } catch(err) {
      get('result').hidden=true;get('download').disabled=true;get('error').textContent=err.message;
    }
  }
  get('form').addEventListener('input',update);get('form').addEventListener('change',update);
  get('form').addEventListener('submit',e=>{e.preventDefault();update()});
  get('reset').onclick=()=>{get('form').reset();update()};
  get('download').onclick=()=>{
    if(!plan)return;
    const compact=t=>stamp(t).replace(/-/g,'');
    const stampUtc=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Honest Little Apps//Renewal review//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
      'UID:renew-'+compact(plan.review)+'-'+compact(plan.cutoff)+'-'+compact(plan.renewal)+'@honestlittleapps.invalid','DTSTAMP:'+stampUtc,
      'DTSTART;VALUE=DATE:'+compact(plan.review),'DTEND;VALUE=DATE:'+compact(plan.review+day),'SUMMARY:Review subscription renewal',
      'DESCRIPTION:Check provider terms before the planned cutoff '+stamp(plan.cutoff)+'.','TRANSP:TRANSPARENT','END:VEVENT','END:VCALENDAR'];
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='renewal-review-'+stamp(plan.review)+'.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  update();
})();
