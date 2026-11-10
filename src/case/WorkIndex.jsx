import React from 'react';
import './styles/work-index.css';
import { DominoMark } from './kit.jsx';
import { caseIndex } from './caseIndex.js';

const isLight = hex => { const n = parseInt(hex.slice(1), 16); return (.2126 * (n >> 16 & 255) + .7152 * (n >> 8 & 255) + .0722 * (n & 255)) / 255 > .62; };
import { PRDS, pageHref } from './prd/registry.js';

export default function WorkIndex() {
  const builds = caseIndex.filter(item => item.slug !== 'whatsapp-inbox');
  const study = caseIndex.find(item => item.slug === 'whatsapp-inbox');
  return <div className="case-root wx-root" data-case="work-index">
    <a className="skip-link" href="#work-main">Skip to the work</a>
    <header className="case-header">
      <a className="identity" href="/" aria-label="Debapallab Das, home"><DominoMark/><span>Debapallab Das<span className="identity-sub">Product + engineering</span></span></a>
      <nav aria-label="Primary"><a href="/#work">The cabinet</a><a href="/about/">About me</a><a className="nav-contact" href="mailto:dev.lucide@gmail.com?subject=About%20your%20work">Say hello <span aria-hidden="true">↗</span></a></nav>
    </header>
    <main id="work-main">
      <section className="wx-hero">
        <h1>Work.</h1>
        <p>Things I built, and product thinking I did on paper. Start with whichever you want to see.</p>
      </section>

      <section className="wx-group" aria-labelledby="studies-title">
        <h2 id="studies-title">Product studies</h2>
        <a className="wx-flagship" href="/work/whatsapp-inbox/" style={{ '--tone': study.color, '--tone-ink': study.ink }}>
          <span className="wx-kicker">Independent study, India, 2015 to 2026</span>
          <strong>WhatsApp: the inbox became a billboard</strong>
          <p>Why business messages, one-time codes and strangers crowd the app Indians use most, and how I would fix it. Six PRDs and seven working prototypes.</p>
          <span className="wx-go">Read the study <span aria-hidden="true">→</span></span>
        </a>
        <div className="wx-prds">
          {PRDS.map(item => <a key={item.slug} className="wx-prd" data-accent={item.accent} href={pageHref(item)}>
            <span className="wx-no">PRD {item.number}</span>
            <h3>{item.name}</h3>
            <p>{item.line}</p>
            <span className="wx-go">Read the PRD <span aria-hidden="true">→</span></span>
          </a>)}
        </div>
      </section>

      <section className="wx-group" aria-labelledby="builds-title">
        <h2 id="builds-title">Builds</h2>
        <div className="wx-builds">
          {builds.map(item => <a key={item.slug} className="wx-build" href={`/work/${item.slug}/`} data-light={isLight(item.color) || undefined} style={{ '--tone': item.color }}>
            <span className="wx-kind">{item.kind}</span>
            <h3>{item.name}</h3>
            <p>{item.line}</p>
            <span className="wx-go">Read the case study <span aria-hidden="true">→</span></span>
          </a>)}
        </div>
      </section>
    </main>
    <footer className="case-footer"><p className="case-footer-name">Debapallab Das</p><div><a href="/">Portfolio home</a><a href="/about/">About me</a><a href="mailto:dev.lucide@gmail.com">dev.lucide@gmail.com</a><a href="https://lucide.in" target="_blank" rel="noreferrer">Lucide Tech ↗</a></div></footer>
  </div>;
}
