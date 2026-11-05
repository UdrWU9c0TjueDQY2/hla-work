/* Run with Playwright and Chromium. Supply a downloaded public calculator HTML file.
   Output frames are screenshots of that functioning page at its normal mobile layout. */
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dir = path.resolve(process.argv[2] || '.');
const frames = path.join(dir, 'frames');
fs.mkdirSync(frames, {recursive:true});
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CAPTURE_CHROME || '/tmp/sturdy-v5-browser/chrome',args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
  const page = await browser.newPage({viewport:{width:448,height:462},deviceScaleFactor:1,locale:'en-US'});
  await page.route('https://**/*', route => route.abort());
  await page.goto('file://' + path.join(dir, 'public.html'));
  const start = page.locator('#start'), end = page.locator('#end');
  const buffer = page.locator('#buffer');
  const apply = page.locator('#form button[type=submit]');
  await start.fill('09:00'); await end.fill('12:00');
  await page.locator('#duration').fill('30'); await buffer.fill('0');
  await apply.click(); assert.equal(await page.locator('#count').innerText(), '6');
  assert.match(await page.locator('#finish').innerText(),/12:00/);
  const scrollTop = id => page.locator(id).evaluate(el=>scrollY+el.getBoundingClientRect().top);
  const jump = async pos => page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),pos);
  let frame = 0;
  async function capture(n) {
    const pixels = await page.screenshot({animations:'disabled'});
    for(let i=0;i<n;i++) fs.writeFileSync(path.join(frames,String(frame++).padStart(3,'0')+'.png'),pixels);
  }
  async function travel(to) {
    const from = await page.evaluate(()=>scrollY);
    for(let i=1;i<=6;i++){const t=i/6; await jump(from+(to-from)*(t*t*(3-2*t))); await capture(1);}
  }
  await jump(await scrollTop('#result')-12); await capture(24);
  const bufferTop = await scrollTop('label[for=buffer]')-105;
  await travel(bufferTop);
  await buffer.focus(); await capture(8); await buffer.fill('10'); await capture(22);
  await apply.press('Enter');
  assert.equal(await page.locator('#count').innerText(), '4');
  assert.match(await page.locator('#finish').innerText(),/11:30/);
  assert.equal(await page.locator('#spare').innerText(),'30 min');
  const slots = await page.locator('#slots li').allInnerTexts();
  assert.equal(slots.length,4);
  assert.match(slots.at(-1),/11:00.*11:30/s);
  await travel(await scrollTop('#result')-12); await capture(32);
  await travel(await scrollTop('#slots')-32); await capture(40);
  console.log(JSON.stringify({frames:frame,frameRate:8,before:6,after:4,afterEnd:'11:30',remainingMinutes:30,slots}));
  await browser.close();
})().catch(err=>{console.error(err);process.exit(1)});
