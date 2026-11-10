import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { Window } from 'happy-dom';
import { build } from 'esbuild';

const window = new Window({ url: 'http://localhost:4174', settings: { enableIframePageLoading:false } });
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'SVGElement', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'ResizeObserver', 'IntersectionObserver']) {
  Object.defineProperty(globalThis, name, { configurable: true, value: name === 'window' ? window : window[name] });
}
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// Happy DOM supplies SVG elements but not the browser's transform-list consolidation.
if (window.SVGTransformList) window.SVGTransformList.prototype.consolidate = () => null;
let reduced = true;
window.matchMedia = query => ({ matches: query.includes('prefers-reduced-motion: reduce') ? reduced : false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const scrollTargets = [];
window.HTMLElement.prototype.scrollIntoView = function() { scrollTargets.push(this.id); };
window.scrollTo = () => {};

const output = path.resolve('.openai/local/test-app.mjs');
await mkdir(path.dirname(output), { recursive: true });
await build({ stdin: { contents: "export {default} from './src/App.jsx'; export {gsap} from 'gsap'; export {ScrollTrigger} from 'gsap/ScrollTrigger';", resolveDir: process.cwd(), sourcefile: 'test-entry.js' }, outfile: output, bundle: true, platform: 'node', format: 'esm', target: 'es2022', jsx: 'automatic', external: ['react', 'react-dom', 'react-dom/*'], logLevel: 'silent' });
const React = await import('react');
const { render, fireEvent, cleanup, waitFor, act } = await import('@testing-library/react');
const { default: App, gsap, ScrollTrigger } = await import(pathToFileURL(output));
afterEach(() => cleanup());

test('initial load and scroll cannot expose or activate later chapters', async () => {
  const view = render(React.createElement(App));
  assert.equal(view.getByTestId('journey-content').hidden, true);
  assert.equal(view.getByTestId('journey-content').getAttribute('inert'), '');
  fireEvent.scroll(window);
  assert.equal(document.querySelector('.site-root').dataset.journeyPhase, 'idle');
  assert.equal(ScrollTrigger.getAll().length, 0);
  assert.equal(view.queryByRole('heading', { name: /Think it through/ }), null);
  assert.equal(view.queryByTestId('journey-thread'), null);
  cleanup();
});

test('one CTA unlocks the complete site and automatically enters work even without WebGL', async () => {
  scrollTargets.length = 0;
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('button', { name: 'Push the first domino to enter the portfolio' }));
  await waitFor(() => assert.equal(document.querySelector('.site-root').dataset.journeyPhase, 'active'));
  assert.equal(view.getByTestId('journey-content').hidden, false);
  assert.equal(view.getByTestId('journey-content').hasAttribute('inert'), false);
  assert.ok(scrollTargets.includes('work'));
  assert.equal(document.activeElement.id, 'work-title');
  assert.equal(document.querySelectorAll('.folder-content button').length, 9);
  assert.ok(view.getByRole('heading', { name: /Different problems/ }));
  assert.ok(view.getByRole('heading', { name: /Meet the person/ }));
  assert.equal(view.queryByRole('button', { name: /Explore the work/ }), null);
  assert.ok(view.getByTestId('journey-thread'));
  cleanup();
});

test('project filtering opens complete files and replay resets the journey', async () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Selected work' }));
  fireEvent.click(view.getByRole('button', { name: 'Concepts' }));
  assert.equal(document.querySelectorAll('.cabinet-drawer').length, 1);
  const opener = document.querySelector('.folder-content button');
  fireEvent.click(opener);
  assert.equal(document.querySelector('.project-file-dialog').open, true);
  assert.equal(document.querySelector('.project-file-toolbar h2').textContent, 'Culprit');
  assert.equal(document.querySelector('.project-file-body iframe').getAttribute('src'), '/work/culprit/?file=1');
  assert.match(document.querySelector('.project-file-toolbar').textContent, /concept/);
  fireEvent.click(view.getByRole('button', { name: 'Return to cabinet' }));
  assert.equal(document.querySelector('.project-file-dialog'), null);
  fireEvent.click(view.getByRole('button', { name: 'All work' }));
  fireEvent.click(document.querySelector('#drawer-luman .folder-content button'));
  assert.equal(document.querySelector('.project-file-body iframe').getAttribute('src'), '/work/luman/?file=1');
  fireEvent.click(view.getByRole('button', { name: 'Return to cabinet' }));
  fireEvent.click(view.getByRole('button', { name: 'Back to the first piece' }));
  await waitFor(() => assert.equal(view.getByTestId('journey-content').hidden, true));
  assert.equal(document.querySelector('.site-root').dataset.journeyPhase, 'idle');
});

test('the introduction says who I am and points to the story and the work', () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Selected work' }));
  assert.match(document.getElementById('work-title').textContent, /started with design/);
  assert.equal(document.querySelectorAll('.about-slide').length, 4);
  assert.equal(document.querySelector('.work-about .chapter-exit a[href="/about/"]').textContent.trim().startsWith('Read my story'), true);
  assert.ok(document.querySelector('.work-about .chapter-exit a[href="#workflow"]'));
  assert.equal(document.querySelector('.superforms-chapter'), null);
  cleanup();
});

test('skip navigation opens a plain reading route without activating the cinematic mode', async () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Selected work' }));
  assert.equal(document.querySelector('.site-root').dataset.journeyMode, 'direct');
  assert.equal(view.getByTestId('journey-content').hidden, false);
  assert.equal(view.queryByTestId('journey-thread'), null);
  cleanup();
});

test('hover pulls only the drawer, click opens its panel, and Escape closes it', async () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Selected work' }));
  const drawers = document.querySelectorAll('.cabinet-drawer');
  const front = drawers[0].querySelector('.drawer-front');
  fireEvent.pointerEnter(drawers[0], { pointerType:'mouse' });
  act(() => front.focus());
  assert.equal(drawers[0].dataset.open, 'false');
  await waitFor(() => assert.equal(drawers[0].dataset.open, 'true'));
  assert.equal(drawers[0].dataset.pinned, 'false');
  assert.equal(drawers[0].dataset.notesOpen, 'false');
  assert.equal(drawers[0].querySelector('.drawer-inspector').hasAttribute('inert'), true);
  assert.equal(drawers[0].querySelector('.drawer-paper-window').hasAttribute('inert'), true);
  fireEvent.click(front);
  assert.equal(drawers[0].dataset.pinned, 'true');
  assert.equal(front.getAttribute('aria-expanded'), 'true');
  const choices = drawers[0].querySelectorAll('.drawer-card-selector button');
  assert.equal(choices[0].getAttribute('aria-pressed'), 'true');
  fireEvent.pointerEnter(choices[1], { pointerType:'mouse' });
  act(() => choices[1].focus());
  assert.equal(choices[0].getAttribute('aria-pressed'), 'true');
  fireEvent.click(choices[1]);
  assert.equal(choices[1].getAttribute('aria-pressed'), 'true');
  fireEvent.keyDown(choices[1], { key:'Escape' });
  assert.equal(drawers[0].dataset.open, 'false');
  assert.equal(document.activeElement, front);
  assert.equal(drawers[0].querySelector('.drawer-files').hasAttribute('inert'), true);
  fireEvent.click(front);
  assert.equal(choices[1].getAttribute('aria-pressed'), 'true');
  fireEvent.click(drawers[1].querySelector('.drawer-front'));
  assert.equal(drawers[0].dataset.open, 'false');
  assert.equal(drawers[1].dataset.open, 'true');
  fireEvent.click(drawers[1].querySelector('.drawer-close'));
  assert.equal(drawers[1].dataset.open, 'false');
  fireEvent.click(front);
  fireEvent.click(front);
  assert.equal(drawers[0].dataset.open, 'false');
});

test('every drawer opens its complete case study and old summary tabs are gone', () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Selected work' }));
  assert.equal(document.querySelector('.file-navigation'), null);
  for (const button of document.querySelectorAll('.folder-content button')) {
    const id = button.closest('.drawer-files').id.slice(7);
    fireEvent.click(button);
    assert.equal(document.querySelector('.project-file-body iframe').getAttribute('src'), `/work/${id}/?file=1`);
    assert.equal(document.documentElement.style.overflow, 'hidden');
    fireEvent.click(view.getByRole('button', { name: 'Return to cabinet' }));
    assert.notEqual(document.documentElement.style.overflow, 'hidden');
  }
});

test('complete files switch projects, close on Escape, and restore opener focus', async () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Selected work' }));
  const opener = document.querySelector('#drawer-superforms .folder-content button');
  opener.focus();
  fireEvent.click(opener);
  assert.equal(document.querySelector('.project-file-toolbar h2').textContent, 'Superforms');
  fireEvent.click(view.getByRole('button', { name: 'Next project file' }));
  assert.equal(document.querySelector('.project-file-toolbar h2').textContent, 'Mindspace');
  fireEvent(document.querySelector('.project-file-dialog'), new window.Event('cancel', { bubbles:true, cancelable:true }));
  await waitFor(() => assert.equal(document.querySelector('.project-file-dialog'), null));
  await waitFor(() => assert.equal(document.activeElement.closest('.drawer-files')?.id, 'drawer-superforms'));
});

test('navigation interrupts the handoff without allowing its old completion to steal focus', async () => {
  reduced = false;
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('button', { name: 'Push the first domino to enter the portfolio' }));
  fireEvent.click(view.getByRole('link', { name: /Talk to me/, exact: false }));
  assert.equal(document.querySelector('.site-root').dataset.journeyPhase, 'active');
  assert.equal(document.activeElement.id, 'contact-title');
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 4200)); });
  // Happy DOM can reset activeElement during ScrollTrigger's measurement cleanup.
  // Check that the cancelled handoff never transfers focus back to its old target.
  assert.notEqual(document.activeElement.id, 'work-title');
  cleanup(); reduced = true;
});

test('with motion enabled, scrolling before activation still creates no chapter animations', () => {
  reduced = false;
  const view = render(React.createElement(App));
  fireEvent.scroll(window);
  assert.equal(ScrollTrigger.getAll().length, 0);
  assert.equal(view.getByTestId('journey-content').hidden, true);
  cleanup();
  reduced = true;
});

test('motion-enabled first activation automatically completes its handoff without another CTA', async () => {
  reduced = false;
  const view = render(React.createElement(App));
  assert.equal(ScrollTrigger.getAll().length, 0);
  fireEvent.click(view.getByRole('button', { name: 'Push the first domino to enter the portfolio' }));
  assert.equal(document.querySelector('.site-root').dataset.journeyMode, 'cinematic');
  assert.equal(view.getByTestId('journey-content').hidden, false);
  assert.ok(view.getByTestId('journey-thread'));
  await waitFor(() => assert.equal(document.querySelector('.site-root').dataset.journeyPhase, 'active'), { timeout: 5000 });
  assert.equal(document.activeElement.id, 'work-title');
  cleanup();
  reduced = true;
});

test('the Talk to me navigation opens the right chapter and transfers keyboard focus there', () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: /Talk to me/, exact: false }));
  assert.equal(document.querySelector('.site-root').dataset.journeyMode, 'direct');
  assert.equal(document.activeElement.id, 'contact-title');
  cleanup();
});

test('email copying confirms success and exposes a usable fallback when unavailable', async () => {
  let copied;
  Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: { writeText: async value => { copied = value; } } });
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Selected work' }));
  fireEvent.click(view.getByRole('button', { name: 'Copy email' }));
  await waitFor(() => assert.ok(view.getByRole('button', { name: 'Copied' })));
  assert.equal(copied, 'dev.lucide@gmail.com');
  window.navigator.clipboard.writeText = async () => { throw new Error('Unavailable'); };
  fireEvent.click(view.getByRole('button', { name: 'Copied' }));
  await waitFor(() => assert.match(document.querySelector('.copy-status').textContent, /Copy unavailable/));
  assert.ok(document.querySelector('.email-link').href.startsWith('mailto:'));
  cleanup();
});

after(async () => {
  cleanup();
  ScrollTrigger.killAll();
  ScrollTrigger.disable();
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
  await act(async () => { await window.happyDOM.abort(); });
  await rm(output, { force: true });
});

test('the case-study shelf links every project to its own case-study page', async () => {
  const view = render(React.createElement(App));
  fireEvent.click(view.getByRole('link', { name: 'Case studies' }));
  const links = [...document.querySelectorAll('#cases .shelf-list a')].map(link => link.getAttribute('href'));
  assert.deepEqual(links.sort(), ['comparefi', 'culprit', 'gdc', 'lucide', 'luman', 'mindspace', 'notaprompt', 'poker', 'superforms', 'whatsapp-inbox'].map(slug => `/work/${slug}/`));
  cleanup();
});
