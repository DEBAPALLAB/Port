// Screenshots of a PRD page. Usage: node scripts/prd-shots.mjs <slug> <width> <outdir> '<json steps>'  (same steps as wi-shots)
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync } from 'node:fs';
const [slug, width, dir, spec] = [process.argv[2], Number(process.argv[3]), process.argv[4], JSON.parse(process.argv[5] || '[]')];
const base = process.env.CASE_BASE || 'http://127.0.0.1:5173';
mkdirSync(dir, { recursive: true });
const browser = await Browser.launch();
try {
  const mobile = width < 700;
  const page = await browser.newPage({ width, height: mobile ? 844 : 900, mobile });
  await page.goto(`${base}/work/${slug}/`, { settleMs: 2200 });
  for (const step of spec) {
    if (step.click) await page.eval(`(()=>{const el=document.querySelector(${JSON.stringify(step.click)});if(!el)throw new Error('no ${step.click}');el.click();})()`);
    if (step.scroll) await page.eval(`(()=>{const el=document.querySelector(${JSON.stringify(step.scroll)});if(!el)throw new Error('no ${step.scroll}');window.scrollTo({top:el.getBoundingClientRect().top+scrollY-${step.offset ?? 90},behavior:'instant'});})()`);
    if (step.wait) await sleep(step.wait);
    if (step.shot) { await sleep(900); await page.screenshot({ path: `${dir}/${step.shot}.jpg`, quality: 80 }); }
  }
  console.log(JSON.stringify(await page.eval(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, height: document.documentElement.scrollHeight }))));
} finally { await browser.close(); }
