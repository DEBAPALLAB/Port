// Renders /social/ to a 1080x1350 PNG. Usage: node scripts/social-shot.mjs <out.png>
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const out = process.argv[2] || 'social-card.png';
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ width: 1080, height: 1350 });
  await page.goto('http://127.0.0.1:5173/social/', { settleMs: 2500 });
  await sleep(800);
  await page.screenshot({ path: out });
  console.log(JSON.stringify(await page.eval(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }))));
} finally { await browser.close(); }
