const fs = require('fs');
const path = require('path');

const page = process.argv[2] || path.join(
  __dirname,
  '..',
  'src',
  'moneyshield',
  'subscription-tracker-no-bank-link',
  'index.html'
);
const html = fs.readFileSync(page, 'utf8');
let passed = 0;

function check(condition, message) {
  if (!condition) throw new Error(message);
  passed += 1;
}

for (const unsupported of [
  'catches a renewal just as well',
  'The whole category exists because they are not',
  'never see an account',
  'first session is ten minutes',
  'Nothing leaves your phone',
  'Ten minutes of entry up front',
  'under a minute',
  'takes five minutes to set up',
  'faster and keeps the proof',
  'will surface recurring charges you forgot existed',
  'manual apps are better at privacy',
  'can always be cancelled from iPhone Settings'
]) {
  check(!html.includes(unsupported), `unsupported claim remains: ${unsupported}`);
}

for (const required of [
  'manual reminder can alert you before the date you entered',
  'Bank-linked detection and manual entry solve different jobs',
  'It only knows the subscriptions and deadlines you enter',
  'manual entry instead of requiring a linked bank feed',
  "Check each app's current privacy label and policy before choosing",
  'Setup time depends on how many items you add',
  'Whether the free limits fit depends on how many items and alert dates you need',
  'you still complete and verify the cancellation yourself',
  'reminders only cover items you supplied',
  'Start with one subscription, then add the others at your own pace',
  'Compare current features, prices and privacy disclosures',
  'may surface recurring charges you forgot',
  "Compare each app's current privacy disclosures and features",
  'Apple publishes current steps for cancelling Apple-billed subscriptions in iPhone Settings'
]) {
  check(html.includes(required), `required qualification missing: ${required}`);
}

check((html.match(/class="myth"/g) || []).length === 4, 'expected four myth cards');
check((html.match(/class="myth"><button type="button" aria-pressed="false"/g) || []).length === 4,
  'every myth card must start as a real unpressed button');
check(html.includes("b.setAttribute('aria-pressed',on?'true':'false')"),
  'myth interaction must keep aria-pressed in sync');
check(/https:\/\/apps\.apple\.com\/app\/id6787559121\?ct=work-subscription-tracker-no-b(?:&|&amp;)mt=8/.test(html),
  'expected exact MoneyShield Apple ID link');
check(html.includes('Honest Little Apps · ours'), 'publisher relationship disclosure missing');
check(html.includes('$3.99/mo, $24.99/yr or $59.99 once (listing, US)'),
  'current visible US purchase choices missing');

const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(match => JSON.parse(match[1]));
check(schemas.length >= 2, 'expected page and FAQ JSON-LD');
const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
check(Boolean(faq), 'FAQPage JSON-LD missing');
check(faq.mainEntity.length === 6, 'expected six structured FAQ entries');
check(faq.mainEntity.every(item => item.acceptedAnswer && item.acceptedAnswer.text),
  'every structured FAQ needs an answer');
check(faq.mainEntity.some(item => item.acceptedAnswer.text.includes('linked bank feed')),
  'structured FAQ must carry the manual-entry qualification');
check(faq.mainEntity.some(item => item.acceptedAnswer.text.includes('Apple publishes current steps')),
  'structured FAQ must carry the qualified Apple cancellation guidance');

console.log(`PASS ${passed} MoneyShield truthfulness and semantic checks`);
