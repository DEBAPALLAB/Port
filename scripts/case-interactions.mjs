// Exercises the case-study controls in the installed browser, without external services.
import assert from 'node:assert/strict';
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { caseIndex } from '../src/case/caseIndex.js';

const browser = await Browser.launch();
const base = process.env.CASE_BASE || 'http://127.0.0.1:4180';
try {
  const requested = process.argv.slice(2);
  for (const { slug } of caseIndex.filter(item => !requested.length || requested.includes(item.slug))) {
    const page = await browser.newPage({ width: 390, height: 844, mobile: true });
    try {
      await page.goto(`${base}/work/${slug}/`, { settleMs: 1800 });
      assert.equal(await page.eval(() => document.querySelectorAll('h1').length), 1, `${slug}: page rendered`);
      for (const selector of ['.decision-options', '.timeline-track']) {
        const count = await page.eval(s => document.querySelectorAll(s).length, selector);
        for (let i = 0; i < count; i++) {
          await page.eval(({ selector, i }) => {
            const group = document.querySelectorAll(selector)[i];
            group.querySelector('button').click();
          }, { selector, i });
          await sleep(60);
          assert.equal(await page.eval(({ selector, i }) => document.querySelectorAll(selector)[i].querySelector('button').getAttribute('aria-selected'), { selector, i }), 'true', `${slug}: ${selector} selects`);
        }
      }
      if (slug === 'culprit') {
        await page.eval(() => [...document.querySelectorAll('.hunt-tabs button')].find(b => b.textContent === 'dates.ts').click());
        await sleep(60);
        await page.eval(() => document.querySelector('.hunt-code button').click());
        await sleep(80);
        assert.equal(await page.eval(() => !!document.querySelector('.hunt-result')), true, 'Culprit: correct guess reveals mutation');
        assert.match(await page.eval(() => document.querySelector('.hunt-says').textContent), /cause lives here/);
        await page.eval(() => document.querySelector('[aria-label="Blind model solves"] button:nth-child(3)').click());
        await sleep(60);
        assert.equal(await page.eval(() => document.querySelector('.score-raw').textContent), 'Rejected', 'Culprit: blind-model gate');
        await page.eval(() => [...document.querySelectorAll('.hunt-side button')].find(b => b.textContent === 'Start over').click());
        await sleep(60);
        assert.equal(await page.eval(() => !!document.querySelector('.hunt-result')), false, 'Culprit: reset clears result');
      }
      if (slug === 'gdc') {
        const before = await page.eval(() => document.querySelectorAll('.lab-queue li').length);
        await page.eval(() => document.querySelector('.lab-editor form').requestSubmit());
        await sleep(80);
        assert.equal(await page.eval(() => document.querySelectorAll('.lab-queue li').length), before + 1, 'GDC: notice added');
        await page.eval(() => document.querySelector('.lab-queue li button').click());
        await sleep(60);
        assert.equal(await page.eval(() => document.querySelector('.lab-queue li').dataset.off), 'true', 'GDC: notice disabled');
        assert.equal(await page.eval(() => document.querySelectorAll('.lab-audit li').length), 2, 'GDC: both actions audited');
      }
      if (slug === 'comparefi') {
        await page.eval(() => document.querySelector('[aria-label="Product"] button:last-child').click());
        await sleep(80);
        assert.equal(await page.eval(() => document.querySelectorAll('.cf-head [role="columnheader"]').length), 3, 'CompareFi: product changes table schema');
        await page.eval(() => document.querySelector('[aria-label="Criterion"] button:last-child').click());
        await sleep(60);
        assert.equal(await page.eval(() => document.querySelector('[aria-label="Criterion"] button:last-child').getAttribute('aria-pressed')), 'true');
      }
      if (slug === 'superforms') {
        await page.eval(() => document.querySelector('.sf-id-modes button:last-child').click());
        await sleep(60);
        assert.equal(await page.eval(() => document.querySelector('.sf-id-modes button:last-child').getAttribute('aria-pressed')), 'true');
        await page.eval(() => document.querySelector('.sf-ask-row').requestSubmit());
        await sleep(3200);
        assert.equal(await page.eval(() => document.querySelector('.sf-run').disabled), false, 'Superforms: edit settles');
        assert.equal(await page.eval(() => document.querySelectorAll('.sf-step[data-on="true"]').length), 4, 'Superforms: pipeline completes');
      }
      assert.equal(page.consoleErrors.length, 0, `${slug}: runtime errors`);
      console.log(`ok ${slug}: mobile decision and timeline controls${['culprit', 'gdc', 'comparefi', 'superforms'].includes(slug) ? ', signature interaction' : ''}`);
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
