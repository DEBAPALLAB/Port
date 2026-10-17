// Writes work/<slug>/index.html for each case study. Run after editing the metadata below.
import { mkdirSync, writeFileSync } from 'node:fs';

const pages = {
  superforms: ['Superforms case study', 'How a form builder turns a plain-language brief into a form whose questions keep their identity through every AI edit.'],
  luman: ['Luman case study', 'A team workspace with two dashboards: Classic, a page per tool, and God Mode, a desktop where every tool stays open and one sentence arranges them.'],
  mindspace: ['Mindspace case study', 'Internship work on the new Mindspace: AI voice sessions, assessments, booking and chat.'],
  notaprompt: ['Notaprompt case study', 'An AI-agent simulation for watching how an idea moves through a connected population.'],
  comparefi: ['CompareFi case study', 'Side-by-side comparisons that make Indian lending products easier to understand.'],
  poker: ['Poker Gods case study', 'Chips, buy-ins, blinds, betting and settlement for a home poker table.'],
  gdc: ['GDC Dibrugarh case study', 'The official web portal for Government Dental College, Dibrugarh.'],
  culprit: ['Culprit case study', 'A product concept for debugging real software by following the evidence.'],
  lucide: ['Lucide Tech case study', 'My studio’s site, built eight times: a lamp that lights its own headline, and a name shared with an icon library.'],
};

for (const [slug, [title, description]] of Object.entries(pages)) {
  mkdirSync(`work/${slug}`, { recursive: true });
  writeFileSync(`work/${slug}/index.html`, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title} | Debapallab Das" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin />
    <title>${title} | Debapallab Das</title>
  </head>
  <body>
    <div id="root" data-case="${slug}"></div>
    <script type="module" src="/src/case/entry.jsx"></script>
  </body>
</html>
`);
}
console.log(Object.keys(pages).length, 'pages written');
