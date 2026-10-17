// Captures the first screens of the eight local iterations of the Lucide Tech studio site.
// Each version is started on its own port, photographed at desktop and phone width, then stopped.
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { spawn, execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const root = 'D:/codings/web design tests';
const versions = [
  ['v1', `${root}/v1`, 'next'], ['v2', `${root}/v2`, 'next'], ['v3', `${root}/v3`, 'next'], ['v4', `${root}/v4`, 'next'],
  ['v5', `${root}/v5`, 'next'], ['v6', `${root}/v6/lucide-forge`, 'vite'], ['v7', `${root}/v7`, 'next'], ['v8', `${root}/v8`, 'next'],
];
const only = process.argv.slice(2);
const out = 'public/cases/lucide/versions';
mkdirSync(out, { recursive: true });
const report = {};

async function waitFor(url, ms = 120000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { const res = await fetch(url); if (res.status < 500) return true; } catch {}
    await sleep(1000);
  }
  return false;
}

const browser = await Browser.launch();
try {
  for (const [id, dir, kind] of versions) {
    if (only.length && !only.includes(id)) continue;
    const port = 3300 + Number(id.slice(1));
    const cmd = kind === 'vite' ? `npx vite --port ${port} --strictPort` : `npx next dev -p ${port}`;
    const child = spawn(cmd, { cwd: dir, shell: true, stdio: 'ignore' });
    const url = `http://localhost:${port}/`;
    report[id] = [];
    try {
      if (!await waitFor(url)) { report[id].push('ERROR: server never answered'); continue; }
      await (await fetch(url)).text(); // first compile
      for (const [label, width, height, mobile] of [['desktop', 1440, 900, false], ['mobile', 390, 844, true]]) {
        const page = await browser.newPage({ width, height, mobile });
        try {
          await page.goto(url, { settleMs: 9000, timeoutMs: 120000 });
          // Hide Next's dev indicator so it does not end up in the picture.
          await page.eval(`document.querySelectorAll('nextjs-portal').forEach(n => n.remove())`);
          const total = await page.eval('document.documentElement.scrollHeight');
          const stops = label === 'desktop' ? [0, 1.1, 2.2].map(f => Math.round(f * height)).filter(y => y < total - height * .4) : [0];
          for (const [i, y] of stops.entries()) {
            await page.eval(`window.scrollTo(0, ${y})`);
            await sleep(2200);
            await page.eval(`document.querySelectorAll('nextjs-portal').forEach(n => n.remove())`);
            const path = `${out}/${id}-${label}-${i}.jpg`;
            await page.screenshot({ path, quality: 82 });
            report[id].push(path);
          }
        } catch (error) {
          report[id].push(`ERROR ${label}: ${error.message}`);
        } finally {
          await page.close?.();
        }
      }
    } finally {
      try { execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' }); } catch {}
    }
    console.log(id, report[id]);
  }
} finally {
  await browser.close();
  // Only the frames the case study uses are kept in the repository.
}
