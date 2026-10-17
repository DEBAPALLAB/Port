import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const browser = await Browser.launch();
const out = '.taste-skill/thread';
mkdirSync(out, { recursive: true });
async function check(page) {
  const result = await page.eval(() => {
    const root = document.querySelector('.site-root');
    const path = document.querySelector('.journey-thread-ink');
    const stations = [...document.querySelectorAll('.thread-station')];
    const selectors = ['#work .work-intro', '#workflow > .workflow-heading', '#connect .personal-invitation'];
    const expected = selectors.map(selector => {
      let node = root.querySelector(selector), top = -32;
      while (node && node !== root) { top += node.offsetTop; node = node.offsetParent; }
      return top;
    });
    const actual = stations.map(node => node.transform.baseVal.getItem(0).matrix.f);
    const length = path.getTotalLength();
    let previous = -Infinity, monotonic = true;
    for (let i = 0; i <= 2000; i++) {
      const point = path.getPointAtLength(length * i / 2000);
      if (point.y < previous - .01) monotonic = false;
      previous = point.y;
    }
    return { expected, actual, monotonic, shown: stations.every(node => getComputedStyle(node).display !== 'none') };
  });
  assert.equal(result.monotonic, true, 'the complete SVG never doubles back');
  assert.equal(result.shown, true, 'all three station anchors exist');
  assert.deepEqual(result.actual, result.expected, 'stations follow section layout');
  assert.ok(result.actual.every((y, i) => !i || y > result.actual[i - 1]));
}
try {
  for (const width of [2046, 1440, 768, 390]) {
    const page = await browser.newPage({ width, height: width === 390 ? 844 : 1000, mobile: width === 390 });
    try {
      await page.goto(process.env.PERSONAL_BASE || 'http://127.0.0.1:5173', { settleMs: 700 });
      await page.eval(() => document.getElementById('start-journey').click());
      for (let i = 0; i < 90; i++) {
        if (await page.eval(() => document.querySelector('.site-root').dataset.journeyPhase === 'active')) break;
        await sleep(100);
      }
      await sleep(500);
      await check(page);
      await page.eval(() => {
        const section = document.getElementById('workflow');
        window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - 400, behavior: 'instant' });
      });
      await sleep(900);
      await check(page);
      await page.screenshot({ path: `${out}/${width}-transition.jpg`, quality: 90 });
      await page.eval(() => document.querySelectorAll('.collection-filters button')[3].click());
      await sleep(400);
      await check(page);
      await page.eval(() => document.getElementById('connect').scrollIntoView({ behavior: 'instant' }));
      await sleep(800);
      await check(page);
      assert.equal(page.consoleErrors.length, 0);
      console.log(`ok ${width}: forward path, section stations, scroll and cabinet layout changes`);
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
