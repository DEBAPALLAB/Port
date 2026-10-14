// Capture the actual builder component with isolated sample data. No production
// credentials, customer records, database writes or AI calls are involved.
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { Browser, sleep } from 'file:///C:/Users/Dasad/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const source = process.env.SUPERFORMS_REPO || 'D:/codings/formy/superform-v2';
const out = resolve('.tmp/superforms-builder');
mkdirSync(out, { recursive: true });
const fixture = {
  id: 'portfolio-sample', user_id: 'sample-creator', title: 'Design workshop signup',
  status: 'draft', slug: 'design-workshop-sample', aesthetic: 'Editorial', surface: 'Card',
  typography: 'MD', radius: 'MD', transition_style: 'Slide', progress_style: 'Bar',
  questions: [
    { id: 1, type: 'short', label: 'What should we call you?', description: 'Your name helps us welcome you.', required: true, settings: { show_cover_page: false, last_active_question: 1 } },
    { id: 2, type: 'email', label: 'Where can we send your ticket?', required: true },
    { id: 3, type: 'multiple', label: 'Which session are you joining?', options: ['Product decisions', 'Interface craft', 'Shipping your first version'], required: true },
    { id: 4, type: 'long', label: 'What would you like to learn?', description: 'Tell us what you are working on.' },
    { id: 5, type: 'dropdown', label: 'Any dietary needs?', options: ['None', 'Vegetarian', 'Vegan', 'Other'] },
  ],
};
writeFileSync(`${out}/services.jsx`, `import React from 'react';
const form = ${JSON.stringify(fixture)};
const user = {id:'sample-creator',email:'sample@example.com',user_metadata:{full_name:'Sample creator'}};
export const supabase = {auth:{getUser:async()=>({data:{user}}),getSession:async()=>({data:{session:{user}}})},from(table){
 const data=table==='forms'?form:{tier:'Creator',ai_edit_count:0,ai_edit_period_start:new Date().toISOString()};
 const result={data,error:null}; const chain={then(resolve){return Promise.resolve(result).then(resolve)}};
 for(const method of ['select','eq','single','update','insert','upsert','delete','order','limit','maybeSingle'])chain[method]=()=>chain;
 return chain;
}};
export function useParams(){return {formId:form.id};}
export function useRouter(){return {push(){},replace(){}};}
export function useModal(){return {alert:async()=>{},confirm:async()=>true};}
export function useUpgrade(){return {open(){}};}
export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>;}
`);
writeFileSync(`${out}/analytics.js`, 'export default {capture(){},identify(){},reset(){}};');
writeFileSync(`${out}/entry.jsx`, `import React from 'react';import {createRoot} from 'react-dom/client';import Builder from '${source}/app/builder/[formId]/page.tsx';createRoot(document.getElementById('root')).render(<Builder/>);`);
const alias = {
  '@': source, 'next/link': `${out}/services.jsx`, 'next/navigation': `${out}/services.jsx`,
  '@/lib/supabase': `${out}/services.jsx`, '@/components/ModalProvider': `${out}/services.jsx`,
  '@/components/UpgradeProvider': `${out}/services.jsx`, 'posthog-js': `${out}/analytics.js`,
  react: `${source}/node_modules/react`, 'react-dom': `${source}/node_modules/react-dom`,
};
await build({ entryPoints: [`${out}/entry.jsx`], outfile: `${out}/builder.js`, bundle: true, format: 'esm', jsx: 'automatic', alias, minify: true, define: { 'process.env.NODE_ENV': '"production"' } });
const requireSource = createRequire(`${source}/package.json`);
const postcss = requireSource('postcss'), tailwind = requireSource('@tailwindcss/postcss');
const css = readFileSync(`${source}/app/globals.css`, 'utf8') + `\n@source "${source}/app/builder";\n@source "${source}/components";\n:root{--font-inter:Arial,sans-serif;--font-cormorant:Georgia,serif;--font-dm-mono:monospace;--font-bebas:Arial,sans-serif;}\n`;
const compiled = await postcss([tailwind({ base: source })]).process(css, { from: `${source}/app/globals.css` });
writeFileSync(`${out}/builder.css`, compiled.css);
writeFileSync(`${out}/index.html`, '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/builder.css"></head><body><div id="root"></div><script type="module" src="/builder.js"></script></body></html>');
const server = createServer((req, res) => {
  const name = req.url === '/' ? 'index.html' : req.url?.slice(1);
  if (!['index.html', 'builder.css', 'builder.js'].includes(name)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', name.endsWith('.css') ? 'text/css' : name.endsWith('.js') ? 'text/javascript' : 'text/html');
  res.end(readFileSync(`${out}/${name}`));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await Browser.launch();
mkdirSync('public/cases/superforms', { recursive: true });
try {
  const page = await browser.newPage({ width: 1440, height: 960 });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { settleMs: 3000 });
  console.log('Builder buttons:', await page.eval(() => [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 40)));
  await page.screenshot({ path: 'public/cases/superforms/builder-build.jpg', quality: 92 });
  for (const [mode, name] of [['DESIGN', 'builder-design'], ['PREVIEW', 'builder-preview']]) {
    const found = await page.eval(mode => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim().toUpperCase() === mode); b?.click(); return !!b; }, mode);
    if (!found) throw new Error(`Missing builder control ${mode}`);
    await sleep(1000);
    await page.screenshot({ path: `public/cases/superforms/${name}.jpg`, quality: 92 });
  }
  await page.eval(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Ask AI')?.click());
  await sleep(800);
  await page.screenshot({ path: 'public/cases/superforms/builder-ai.jpg', quality: 92 });
  console.log('Capture errors:', page.consoleErrors);
  if (page.consoleErrors.length) throw new Error('Builder capture runtime error');
  await page.close();
  const phone = await browser.newPage({ width: 390, height: 844, mobile: true });
  await phone.goto(`http://127.0.0.1:${server.address().port}/`, { settleMs: 2500 });
  await phone.screenshot({ path: 'public/cases/superforms/builder-mobile-build.jpg', quality: 92 });
  for (const [mode, name] of [['DESIGN', 'design'], ['PREVIEW', 'preview']]) {
    await phone.eval(mode => [...document.querySelectorAll('button')].find(b => b.textContent.trim().toUpperCase() === mode)?.click(), mode);
    await sleep(900);
    await phone.screenshot({ path: `public/cases/superforms/builder-mobile-${name}.jpg`, quality: 92 });
  }
  await phone.eval(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Ask AI')?.click());
  await sleep(700);
  await phone.screenshot({ path: 'public/cases/superforms/builder-mobile-ai.jpg', quality: 92 });
  if (phone.consoleErrors.length) throw new Error('Mobile builder capture runtime error');
  await phone.close();
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
writeFileSync('public/cases/superforms/builder-captures.json', JSON.stringify({ source: 'Actual builder component, local isolated sample form', capturedAt: new Date().toISOString(), data: 'Sample workshop form; no customer data', fonts: 'System fallbacks for the local capture', files: ['builder-build.jpg', 'builder-design.jpg', 'builder-preview.jpg', 'builder-ai.jpg', 'builder-mobile-build.jpg', 'builder-mobile-design.jpg', 'builder-mobile-preview.jpg', 'builder-mobile-ai.jpg'] }, null, 2));
