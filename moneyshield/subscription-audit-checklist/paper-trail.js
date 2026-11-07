(() => {
  const get = id => document.getElementById('trail-' + id);
  const form = get('form');
  if (!form) return;
  const rows = [];
  let downloadUrl = '';

  const clean = (value, max) => String(value || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value + 'T00:00:00Z'))
    && new Date(Date.parse(value + 'T00:00:00Z')).toISOString().slice(0, 10) === value;
  const displayDate = value => new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
  }).format(Date.parse(value + 'T00:00:00Z'));

  function summary() {
    const lines = [
      'MoneyShield companion — cancellation or change paper trail',
      '',
      rows.length ? 'Checkpoints: ' + rows.length : 'No checkpoints added.'
    ];
    rows.forEach((row, index) => {
      lines.push('', (index + 1) + '. ' + row.type + ' — ' + row.date);
      lines.push('   Service label: ' + (row.service || 'Not recorded'));
      lines.push('   Biller: ' + row.biller);
      if (row.note) lines.push('   Reminder: ' + row.note);
    });
    const hasRequest = rows.some(row => row.type === 'Request sent');
    const hasConfirmation = rows.some(row => row.type === 'Provider confirmation received');
    lines.push('');
    if (hasConfirmation) {
      lines.push('A provider confirmation is marked in this private note. Verify it against the provider’s official record.');
    } else if (hasRequest) {
      lines.push('A request is recorded, but no provider confirmation is marked.');
    } else {
      lines.push('A planned action or request sent is not provider confirmation.');
    }
    lines.push('This browser companion does not contact a provider, change a subscription or verify an outcome.');
    return lines.join('\n');
  }

  function releaseUrl() {
    if (downloadUrl && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(downloadUrl);
    downloadUrl = '';
  }

  function render(message) {
    get('list').replaceChildren(...rows.map((row, index) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = row.type + ' — ' + displayDate(row.date);
      const detail = document.createElement('div');
      detail.textContent = (row.service || 'No service label') + ' · ' + row.biller + (row.note ? ' · ' + row.note : '');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove checkpoint ' + (index + 1);
      remove.addEventListener('click', () => {
        rows.splice(index, 1);
        releaseUrl();
        render('Checkpoint removed. Review the complete record before using it.');
      });
      li.append(strong, detail, remove);
      return li;
    }));
    get('output').value = summary();
    const ready = rows.length > 0;
    ['download', 'select', 'print', 'clear'].forEach(id => { get(id).disabled = !ready; });
    get('add').disabled = rows.length >= 8;
    get('status').textContent = message || (ready
      ? rows.length + ' ' + (rows.length === 1 ? 'checkpoint' : 'checkpoints') + ' in this tab. Review the complete record below.'
      : 'No checkpoints added. A planned action or request sent is not confirmation.');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (rows.length >= 8) {
      get('status').textContent = 'Eight checkpoints are already recorded. Remove one before adding another.';
      return;
    }
    const date = get('date').value;
    if (!validDate(date)) {
      get('status').textContent = 'Enter a valid checkpoint date.';
      get('date').focus();
      return;
    }
    rows.push({
      service: clean(get('service').value, 80),
      biller: get('biller').value,
      type: get('type').value,
      date,
      note: clean(get('note').value, 160)
    });
    get('note').value = '';
    releaseUrl();
    render('Checkpoint added. This private note is not provider confirmation.');
  });

  get('download').addEventListener('click', () => {
    if (!rows.length) return;
    try {
      if (typeof Blob !== 'function' || typeof URL.createObjectURL !== 'function') throw new Error('unsupported');
      releaseUrl();
      downloadUrl = URL.createObjectURL(new Blob(['\ufeff' + summary() + '\n'], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'subscription-paper-trail.txt';
      document.body.append(link);
      link.click();
      link.remove();
      get('status').textContent = 'Download prepared. Check the saved file before relying on it.';
      setTimeout(releaseUrl, 1000);
    } catch {
      get('output').focus();
      get('output').select();
      get('status').textContent = 'A file could not be prepared here. The complete record is selected for manual copying.';
    }
  });
  get('select').addEventListener('click', () => {
    if (!rows.length) return;
    get('output').focus();
    get('output').select();
    get('status').textContent = 'Complete record selected. Use your device’s copy command if you want to copy it.';
  });
  get('print').addEventListener('click', () => {
    if (!rows.length) return;
    document.body.classList.add('print-paper-trail');
    get('status').textContent = 'Print view prepared. Nothing has been sent to a provider.';
    window.print();
    setTimeout(() => document.body.classList.remove('print-paper-trail'), 0);
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-paper-trail'));
  get('clear').addEventListener('click', () => {
    rows.splice(0);
    form.reset();
    releaseUrl();
    render('Private record cleared from this tab.');
  });
  render();
})();
