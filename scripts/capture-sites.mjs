// Captures genuine screenshots of each project's live address for the case studies.
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const sites = {
  luman: 'https://luman.lucide.in',
  superforms: 'https://superforms.in',
  mindspace: 'https://mindspace.ai',
  comparefi: 'https://comparefi.in',
  gdc: 'https://gdcdibrugarh.in',
  notaprompt: 'https://notaprompt.in',
  lucide: 'https://lucide.in',
  poker: 'https://pokergods.vercel.app',
};
const only = process.argv.slice(2);
const browser = await Browser.launch();
const report = {};
try {
  for (const [slug, url] of Object.entries(sites)) {
    if (only.length && !only.includes(slug)) continue;
    const dir = `public/cases/${slug}`;
    mkdirSync(dir, { recursive: true });
    report[slug] = [];
    for (const [label, width, height, mobile] of [['desktop', 1440, 900, false], ['mobile', 390, 844, true]]) {
      const page = await browser.newPage({ width, height, mobile });
      try {
        await page.goto(url, { settleMs: 5000, timeoutMs: 45000 });
        const total = await page.eval('document.documentElement.scrollHeight');
        const stops = [0, 1, 2, 3].map(i => i * height).filter(y => y < total - height * .4);
        for (const [i, y] of stops.entries()) {
          await page.eval(`window.scrollTo(0, ${y})`);
          await sleep(1400);
          const path = `${dir}/${label}-${i}.jpg`;
          await page.screenshot({ path, quality: 84 });
          report[slug].push(path);
        }
      } catch (error) {
        report[slug].push(`ERROR ${label}: ${error.message}`);
      } finally {
        await page.close?.();
      }
    }
    console.log(slug, report[slug].length);
  }
} finally {
  await browser.close();
  writeFileSync('public/cases/captures.json', JSON.stringify(report, null, 2));
}
