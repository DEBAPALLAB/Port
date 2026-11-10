// Screenshots of the home-page case shelf. Usage: node scripts/shelf-shots.mjs <width> <outdir>
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync } from 'node:fs';
const [width, dir] = [Number(process.argv[2]), process.argv[3]];
mkdirSync(dir, { recursive: true });
const browser = await Browser.launch();
try {
  const mobile = width < 700;
  const page = await browser.newPage({ width, height: mobile ? 844 : 900, mobile });
  const errors = [];
  page.browser.on(page.sessionId, 'Runtime.exceptionThrown', e => errors.push(e.exceptionDetails?.exception?.description || 'exception'));
  await page.goto('http://127.0.0.1:5173/', { settleMs: 1800 });
  await page.eval(`document.querySelector('.skip-link').click()`);
  await sleep(1500);
  await page.eval(`document.getElementById('cases').scrollIntoView({behavior:'instant'})`);
  await sleep(2500);
  await page.eval(`window.scrollBy(0, 220)`);
  await sleep(2200);
  await page.screenshot({ path: `${dir}/shelf.jpg`, quality: 82 });
  await page.eval(`window.scrollBy(0, ${mobile ? 700 : 560})`);
  await sleep(1200);
  await page.screenshot({ path: `${dir}/list.jpg`, quality: 82 });
  console.log(JSON.stringify({ errors, status: await page.eval(`document.querySelector('#cases .stage3d')?.dataset.status`) }));
} finally { await browser.close(); }
