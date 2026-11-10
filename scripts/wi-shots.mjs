// Screenshots of the WhatsApp study with scripted interaction.
// Usage: node scripts/wi-shots.mjs <width> <outdir> '<json steps>'   steps: {click:sel} {scroll:sel,offset?} {shot:name} {wait:ms} {full:name}
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync } from 'node:fs';
const [width, dir, spec] = [Number(process.argv[2]), process.argv[3], JSON.parse(process.argv[4] || '[]')];
const base = process.env.CASE_BASE || 'http://127.0.0.1:5173';
mkdirSync(dir, { recursive: true });
const browser = await Browser.launch();
try {
  const mobile = width < 700;
  const page = await browser.newPage({ width, height: mobile ? 844 : 900, mobile });
  await page.goto(`${base}/work/whatsapp-inbox/`, { settleMs: 2200 });
  for (const step of spec) {
    if (step.click) await page.eval(`(()=>{const el=document.querySelector(${JSON.stringify(step.click)});if(!el)throw new Error('no ${step.click}');el.click();})()`);
    if (step.scroll) await page.eval(`(()=>{const el=document.querySelector(${JSON.stringify(step.scroll)});if(!el)throw new Error('no ${step.scroll}');window.scrollTo({top:el.getBoundingClientRect().top+scrollY-${step.offset ?? 90},behavior:'instant'});})()`);
    if (step.wait) await sleep(step.wait);
    if (step.shot) { await sleep(900); await page.screenshot({ path: `${dir}/${step.shot}.jpg`, quality: 80 }); }
  }
  const info = await page.eval(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, height: document.documentElement.scrollHeight }));
  console.log(JSON.stringify(info));
} finally { await browser.close(); }
