// Captures the live lucide.in at the moments the case study discusses:
// the lamp before and after it locks onto the headline, the pinned Work rail, projects, team and contact.
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync } from 'node:fs';

const url = process.env.LUCIDE_URL || 'https://www.lucide.in/';
const out = 'public/cases/lucide/live';
mkdirSync(out, { recursive: true });
const report = [];

const scrollTo = (page, y) => page.eval(`(window.lenis ? window.lenis.scrollTo(${y}, { immediate: true, force: true }) : window.scrollTo(0, ${y}), true)`);
const top = (page, selector) => page.eval(`(() => { const n = document.querySelector('${selector}'); return n ? Math.round(n.getBoundingClientRect().top + window.scrollY) : null; })()`);
const shoot = async (page, name) => { const path = `${out}/${name}.jpg`; await page.screenshot({ path, quality: 84 }); report.push(path); };

const browser = await Browser.launch();
try {
  // Desktop.
  const page = await browser.newPage({ width: 1440, height: 900 });
  await page.goto(url, { settleMs: 1500, timeoutMs: 60000 });
  await page.eval(`sessionStorage.setItem('lucide_intro_played_v1', '1')`);
  await page.goto(url, { settleMs: 5000, timeoutMs: 60000 });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 200, y: 700 });
  await sleep(2500);
  await shoot(page, 'hero-dark');
  const box = await page.eval(`(() => { const r = document.querySelector('.hero-headline').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 3 }; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(box.x), y: Math.round(box.y) });
  await sleep(2200);
  await shoot(page, 'hero-lit');
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 40, y: 880 });

  const work = await top(page, '#work') ?? 900;
  const workHeight = await page.eval(`(() => { const n = document.querySelector('#work'); return n ? n.offsetHeight : 6800; })()`);
  for (const [i, f] of [0.02, 0.27, 0.47, 0.62, 0.8].entries()) {
    await scrollTo(page, Math.round(work + workHeight * f));
    await sleep(1800);
    await shoot(page, `work-${i}`);
  }
  for (const id of ['projects', 'team', 'contact', 'faq']) {
    const y = await top(page, `#${id}`);
    if (y == null) { report.push(`missing #${id}`); continue; }
    await scrollTo(page, y);
    await sleep(2200);
    await shoot(page, id);
  }
  await page.close();

  // Phone: the lamp turns into a spotlight and the headline is lit without hover.
  const phone = await browser.newPage({ width: 390, height: 844, mobile: true });
  await phone.goto(url, { settleMs: 1500, timeoutMs: 60000 });
  await phone.eval(`sessionStorage.setItem('lucide_intro_played_v1', '1')`);
  await phone.goto(url, { settleMs: 5000, timeoutMs: 60000 });
  await shoot(phone, 'm-hero');
  const pWork = await top(phone, '#work') ?? 844;
  await scrollTo(phone, pWork + 900); await sleep(1800); await shoot(phone, 'm-work');
  const pContact = await top(phone, '#contact');
  if (pContact != null) { await scrollTo(phone, pContact + 300); await sleep(1800); await shoot(phone, 'm-contact'); }
  await phone.close();
} finally {
  await browser.close();
  // Only the frames the case study uses are kept in the repository.
  console.log(report);
}
