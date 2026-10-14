import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const base = process.env.CASE_BASE || 'http://127.0.0.1:4180';
const browser = await Browser.launch(), results = [];
const out = '.taste-skill/superforms-revision';
mkdirSync(out, { recursive: true });
try {
  for (const [width, reducedMotion] of [[1440, false], [390, false], [390, true]]) {
    const page = await browser.newPage({ width, height: width === 390 ? 844 : 900, mobile: width === 390, reducedMotion });
    const click = async text => { assert.equal(await page.eval(text => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === text); b?.click(); return !!b; }, text), true, `Missing ${text}`); await sleep(80); };
    try {
      await page.goto(`${base}/work/superforms/`, { settleMs: 2200 });
      assert.deepEqual(await page.eval(() => [...document.querySelectorAll('[data-chapter]')].map(n => n.id)), ['problem', 'product', 'aesthetics', 'decisions', 'lab', 'underhood', 'numbers', 'history', 'next']);
      assert.equal(await page.eval(() => document.querySelector('.case-hero .stage3d').dataset.status), 'ready');
      if (!reducedMotion) await click('Pause animation');
      const frozen = await page.eval(() => document.querySelector('.sf-hero-caption').textContent);
      await sleep(3400);
      assert.equal(await page.eval(() => document.querySelector('.sf-hero-caption').textContent), frozen, 'Paused/reduced hero holds its beat');
      await click('Next edit'); await sleep(500);
      assert.notEqual(await page.eval(() => document.querySelector('.sf-hero-caption').textContent), frozen, 'Manual next edit works');
      await click('Replay'); await sleep(300);
      assert.equal(await page.eval(() => document.querySelector('.sf-hero-caption').textContent), 'Rearrange. Rewrite. Restyle.');

      await page.eval(() => document.querySelector('#product').scrollIntoView({ behavior: 'instant' }));
      for (const label of ['Build', 'Design', 'Preview', 'AI editor', 'Homepage']) {
        await click(label); await sleep(250);
        assert.equal(await page.eval(() => document.querySelector('.sf-builder-shot img').naturalWidth > 0), true, `Loaded ${label} screenshot`);
        if (width === 390 && label !== 'Homepage') assert.match(await page.eval(() => document.querySelector('.sf-builder-shot img').currentSrc), /builder-mobile-/);
      }
      await click('Build');
      await page.screenshot({ path: `${out}/${width}-${reducedMotion ? 'reduced-' : ''}builder.jpg`, quality: 88 });

      await page.eval(() => document.querySelector('#lab').scrollIntoView({ behavior: 'instant' })); await sleep(1500);
      assert.equal(await page.eval(() => document.querySelectorAll('.sf-demo-questions li').length), 5, 'Starting form is readable before any interaction');
      assert.equal(await page.eval(() => document.querySelector('.sf-demo-model .stage3d').dataset.status), 'ready');
      await page.screenshot({ path: `${out}/${width}-${reducedMotion ? 'reduced-' : ''}demo-start.jpg`, quality: 88 });
      for (const [label, expected] of [['Rewrite a question', ['1', '2', '3', '4', '5']], ['Reorder the form', ['2', '1', '3', '4']], ['Change the look', ['1', '2', '3', '4', '5']]]) {
        await click(label); await click('Apply this edit'); await sleep(reducedMotion ? 80 : 1100);
        assert.deepEqual(await page.eval(() => [...document.querySelectorAll('.sf-demo-questions .sf-stamp')].map(n => n.textContent)), expected, 'Edits preserve expected identities');
        assert.match(await page.eval(() => document.querySelector('.sf-demo-result h4').textContent), /Still connected/);
        if (label === 'Rewrite a question') assert.match(await page.eval(() => document.querySelectorAll('.sf-demo-questions li')[3].textContent), /Any dietary needs.*Dropdown/);
      }
      await page.eval(() => document.querySelector('.sf-technical').open = true);
      assert.equal(await page.eval(() => document.querySelectorAll('.sf-step[data-on="true"]').length), 4);
      await click('Reset example');
      assert.equal(await page.eval(() => document.querySelectorAll('.sf-demo-questions li').length), 5);
      assert.equal(await page.eval(() => document.querySelector('.sf-run').disabled), false);
      assert.equal(await page.eval(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      assert.equal(page.consoleErrors.length, 0);
      results.push({ width, reducedMotion, passed: true });
      console.log(`ok Superforms @${width}${reducedMotion ? ' reduced motion' : ''}: sequence, hero pause/next/replay, real screenshots, populated demo, identity preservation, reset`);
    } finally { await page.close(); }
  }
} finally { await browser.close(); writeFileSync(`${out}/interaction-results.json`, JSON.stringify(results, null, 2)); }
