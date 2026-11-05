const byId = (id) => document.getElementById(id);
const fields = Array.from(document.querySelectorAll('#tool select'));
const result = byId('result');
const draft = byId('draft');
const copy = byId('copy');
const copyStatus = byId('copy-status');
const example = byId('sample-request');

function updateCopy() {
  copy.disabled = draft.value.trim().length === 0;
  copyStatus.textContent = '';
}

function clearResult() {
  result.textContent = '';
  draft.value = '';
  example.hidden = true;
  updateCopy();
}

function makeReply(missing) {
  const [date, time, service, duration, place, confirmation] = missing;
  const questions = [];
  if (date && time) questions.push('What date and start time would work for you?');
  else if (date) questions.push('Which calendar date do you mean?');
  else if (time) questions.push('What start time would work for you?');
  if (time) questions.push('If we’re in different time zones, please include yours.');
  if (service) questions.push('Which service would you like?');
  if (duration) questions.push('How much time would you like to set aside?');
  if (place) questions.push('Where would you like to meet, or is this an online appointment?');
  if (confirmation && questions.length === 0) {
    return 'Just checking before I put this on the calendar: would you like me to go ahead with the appointment we discussed?';
  }
  const nextStep = confirmation
    ? 'Once I’ve checked availability, I’ll send you the proposed time to confirm.'
    : 'I’ll check availability before confirming.';
  return ['Thanks for your message!', ...questions, nextStep].join(' ');
}

function buildReply() {
  const missing = fields.map((field) => field.value === 'missing');
  const count = missing.filter(Boolean).length;
  const clear = fields.filter((field) => field.value === 'clear').length;
  const skipped = fields.length - clear - count;
  if (count) {
    result.textContent = count + (count === 1 ? ' detail needs' : ' details need') + ' clarification. ' + clear + ' clear. ' + skipped + ' not applicable.';
    draft.value = makeReply(missing);
  } else {
    result.textContent = clear === 0
      ? 'All six details were marked not applicable. Review which details this request actually needs.'
      : clear + ' clear. ' + skipped + ' not applicable. Check your calendar before confirming the appointment.';
    draft.value = '';
  }
  updateCopy();
}

fields.forEach((field) => field.addEventListener('change', clearResult));
byId('review').addEventListener('click', buildReply);
byId('sample').addEventListener('click', () => {
  const states = ['missing', 'missing', 'clear', 'clear', 'clear', 'na'];
  fields.forEach((field, i) => { field.value = states[i]; });
  example.hidden = false;
  buildReply();
});
byId('reset').addEventListener('click', () => {
  fields.forEach((field) => { field.value = 'missing'; });
  clearResult();
});

draft.addEventListener('input', updateCopy);
copy.addEventListener('click', async () => {
  const message = draft.value;
  if (!message.trim()) return;
  try {
    await navigator.clipboard.writeText(message);
    if (draft.value === message) copyStatus.textContent = 'Reply copied.';
  } catch {
    if (draft.value !== message) return;
    draft.focus();
    draft.select();
    copyStatus.textContent = 'Reply selected. Use your device’s Copy command.';
  }
});
