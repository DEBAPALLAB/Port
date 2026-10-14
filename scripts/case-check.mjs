// Opens case-study pages in headless Chrome at 1440, 768 and 390, reports errors, 3D status, overflow and
// headline wraps, and saves a screenshot of the hero and of every chapter.
// Usage: node scripts/case-check.mjs [slug ...]   (expects `npm run preview -- --port 4180` running)
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';

const base = process.env.CASE_BASE || 'http://127.0.0.1:4180';
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync('work');
const browser = await Browser.launch();
let failed = false;
const results = [];
try {
  for (const slug of slugs) {
    const dir = `.taste-skill/cases/${slug}`;
    mkdirSync(dir, { recursive: true });
    for (const [width, height, mobile] of [[1440, 900, false], [768, 1000, false], [390, 844, true]]) {
      const page = await browser.newPage({ width, height, mobile });
      const logged = [];
      page.browser.on(page.sessionId, 'Runtime.consoleAPICalled', event => {
        if (event.type === 'error') logged.push(event.args.map(arg => arg.value ?? arg.description ?? '').join(' ').slice(0, 300));
      });
      await page.goto(`${base}/work/${slug}/`, { settleMs: 2500 });
      await page.screenshot({ path: `${dir}/${width}-hero.jpg`, quality: 80 });
      const chapters = await page.eval(() => [...document.querySelectorAll('[data-chapter]')].map(node => node.id));
      for (const [index, id] of chapters.entries()) {
        await page.eval(`document.getElementById(${JSON.stringify(id)}).scrollIntoView({behavior:'instant'})`);
        await sleep(1300);
        await page.screenshot({ path: `${dir}/${width}-${String(index + 1).padStart(2, '0')}-${id}.jpg`, quality: 78 });
      }
      await page.eval('window.scrollTo(0, document.documentElement.scrollHeight)');
      await sleep(900);
      const report = await page.eval(() => {
        const lines = node => { const style = getComputedStyle(node); const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.1; return Math.round(node.getBoundingClientRect().height / lh); };
        return {
          stages: [...document.querySelectorAll('.stage3d')].map(node => node.dataset.status),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          longHeadlines: [...document.querySelectorAll('h1, h2')].filter(node => lines(node) > 2).map(node => `${node.tagName} ${lines(node)} lines: ${node.textContent.slice(0, 60)}`),
          images: [...document.images].filter(img => img.complete && !img.naturalWidth).map(img => `broken: ${img.src}`),
          chapters: document.querySelectorAll('[data-chapter]').length,
        };
      });
      // A blank page or a stage stuck loading must never count as a passing capture.
      const errors = [...page.consoleErrors, ...logged];
      const bad = errors.length || !report.chapters || report.overflow || report.longHeadlines.length || report.images.length || !report.stages.length || report.stages.some(status => status !== 'ready');
      if (bad) failed = true;
      results.push({ slug, width, passed: !bad, ...report, errors });
      console.log(`${bad ? 'FAIL' : 'ok  '} ${slug} @${width}`, JSON.stringify({ ...report, errors }));
      await page.close();
    }
  }
} finally {
  await browser.close();
  writeFileSync('.taste-skill/cases/results.json', JSON.stringify(results, null, 2));
}
process.exit(failed ? 1 : 0);
