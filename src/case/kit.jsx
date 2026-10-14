import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import useReducedMotion from '../useReducedMotion.js';
import { caseIndex } from './caseIndex.js';

/* Case-study kit. Every study composes these; each study also brings its own 3D scene and one signature interaction. */

export function DominoMark({ size = 25 }) {
  return <svg className="identity-mark" style={{ width: size, height: size * 1.36 }} viewBox="0 0 26 34" aria-hidden="true"><rect x="3" y="1" width="20" height="32" rx="4" fill="#ed5939" transform="rotate(-9 13 17)"/><path d="M8 17h10" stroke="#fff" strokeWidth="1"/><circle cx="13" cy="9" r="2" fill="#fff"/><circle cx="10" cy="23" r="1.8" fill="#fff"/><circle cx="16" cy="27" r="1.8" fill="#fff"/></svg>;
}

// Staggered entrance for [data-reveal] children. Content is visible without script; reduced motion skips travel.
function useReveal(rootRef, reducedMotion) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || !('IntersectionObserver' in window)) return;
    const items = [...root.querySelectorAll('[data-reveal]')];
    const below = items.filter(item => item.getBoundingClientRect().top > innerHeight * .92);
    below.forEach(item => item.classList.add('reveal-pending'));
    const observer = new IntersectionObserver(entries => {
      const entering = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
      entering.forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 75}ms`);
        item.classList.add('reveal-in');
        observer.unobserve(item);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    below.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [rootRef, reducedMotion]);
}

export function CasePage({ slug, accent, children }) {
  const embedded = new URLSearchParams(window.location.search).get('file') === '1';
  const rootRef = useRef(null), barRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [chapters, setChapters] = useState([]);
  const [current, setCurrent] = useState('');
  useReveal(rootRef, reducedMotion);
  const study = caseIndex.find(item => item.slug === slug);
  const position = caseIndex.findIndex(item => item.slug === slug);
  const next = caseIndex[(position + 1) % caseIndex.length];

  useLayoutEffect(() => {
    const list = [...rootRef.current.querySelectorAll('[data-chapter]')].map(node => ({ id: node.id, title: node.dataset.chapter }));
    setChapters(list);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setCurrent(visible.target.id);
    }, { rootMargin: '-35% 0px -55% 0px' });
    list.forEach(item => observer.observe(document.getElementById(item.id)));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      barRef.current?.style.setProperty('--read', String(max > 0 ? scrollY / max : 0));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);

  return <div className="case-root" ref={rootRef} style={accent ? { '--case-accent': accent } : undefined} data-case={slug} data-file-embedded={embedded}>
    <a className="skip-link" href="#case-main">Skip to the case study</a>
    {!embedded && <header className="case-header">
      <a className="identity" href="/" aria-label="Debapallab Das, home"><DominoMark/><span>Debapallab Das<span className="identity-sub">Product + engineering</span></span></a>
      <nav aria-label="Case study navigation"><a href="/#work">All work</a><a href="/about/">About me</a><a href={`/work/${next.slug}/`}>Next: {next.name}</a><a className="nav-contact" href={`mailto:dev.lucide@gmail.com?subject=${encodeURIComponent(`About ${study?.name || 'your work'}`)}`}>Say hello <span aria-hidden="true">↗</span></a></nav>
      <div className="case-progress" ref={barRef} aria-hidden="true"/>
    </header>}
    {!embedded && chapters.length > 2 && <nav className="case-rail" aria-label="Chapters">
      <ol>{chapters.map(item => <li key={item.id}><a href={`#${item.id}`} aria-current={current === item.id ? 'true' : undefined}><span className="rail-dot" aria-hidden="true"/><span className="rail-label">{item.title}</span></a></li>)}</ol>
    </nav>}
    <main id="case-main">{children}</main>
    {!embedded && <><NextCase next={next}/>
    <footer className="case-footer"><p className="case-footer-name">Debapallab Das</p><div><a href="/">Portfolio home</a><a href="/#work">All work</a><a href="mailto:dev.lucide@gmail.com">dev.lucide@gmail.com</a><a href="https://lucide.in" target="_blank" rel="noreferrer">Lucide Tech ↗</a></div></footer></>}
  </div>;
}

// The 3D object. `scene` is a lazy import of a module whose default export is a setup(api) function and
// whose optional named export `options` configures the studio (see stage.js).
export const Stage3D = forwardRef(function Stage3D({ scene, label, fallback, className = '', onEvent, children, eager = false }, ref) {
  const hostRef = useRef(null), canvasRef = useRef(null), stageRef = useRef(null), eventRef = useRef(onEvent);
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState('waiting');
  eventRef.current = onEvent;
  useImperativeHandle(ref, () => ({ send: (name, payload) => stageRef.current?.send(name, payload) }), []);

  useEffect(() => {
    let cancelled = false, observer;
    const start = async () => {
      let supported = false;
      try {
        const probe = document.createElement('canvas');
        const context = probe.getContext?.('webgl2') || probe.getContext?.('webgl');
        supported = !!context;
        context?.getExtension('WEBGL_lose_context')?.loseContext();
      } catch { supported = false; }
      if (!supported) { setStatus('failed'); return; }
      setStatus('loading');
      try {
        const [{ createStage }, module] = await Promise.all([import('./stage.js'), scene()]);
        await document.fonts?.ready;
        if (cancelled || !canvasRef.current) return;
        stageRef.current = createStage(canvasRef.current, hostRef.current, {
          setup: module.default, options: module.options, reducedMotion,
          onEvent: (name, payload) => eventRef.current?.(name, payload),
          onFail: () => !cancelled && setStatus('failed'),
        });
        if (!cancelled) setStatus(current => current === 'failed' ? current : 'ready');
      } catch (error) {
        console.warn(error);
        if (!cancelled) setStatus('failed');
      }
    };
    if (eager || !('IntersectionObserver' in window)) start();
    else {
      observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { observer.disconnect(); start(); } }, { rootMargin: '600px' });
      observer.observe(hostRef.current);
    }
    return () => { cancelled = true; observer?.disconnect(); stageRef.current?.dispose(); stageRef.current = null; };
  }, [scene, reducedMotion, eager]);

  return <div className={`stage3d ${className}`} ref={hostRef} data-status={status}>
    <canvas ref={canvasRef} className="stage3d-canvas" role="img" aria-label={label}/>
    {fallback && <div className="stage3d-fallback" aria-hidden={status === 'ready'}>{fallback}</div>}
    {children}
  </div>;
});

export function CaseHero({ name, title, lede, facts = [], links = [], stage, note }) {
  return <section className="case-hero" aria-labelledby="case-title">
    <div className="case-hero-copy">
      <p className="case-hero-name" data-reveal>{name}</p>
      <h1 id="case-title" data-reveal>{title}</h1>
      <p className="case-hero-lede" data-reveal>{lede}</p>
      {links.length > 0 && <div className="case-actions" data-reveal>{links.map((link, index) => <a key={link.href} className={index === 0 ? 'case-button' : 'case-link'} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{link.label}{link.href.startsWith('http') && <span aria-hidden="true"> ↗</span>}</a>)}</div>}
    </div>
    <div className="case-hero-stage">{stage}{note && <p className="stage-note">{note}</p>}</div>
    {facts.length > 0 && <dl className="case-facts" data-reveal>{facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
  </section>;
}

// A chapter registers itself in the side rail. tone: plain | paper | ink | accent changes the whole field.
export function Chapter({ id, title, heading, tone = 'plain', wide = false, children, className = '' }) {
  return <section id={id} data-chapter={title} className={`case-chapter tone-${tone} ${wide ? 'is-wide' : ''} ${className}`} aria-labelledby={`${id}-title`}>
    <div className="chapter-inner">
      <h2 id={`${id}-title`} data-reveal>{heading || title}</h2>
      {children}
    </div>
  </section>;
}

export function Prose({ children, className = '' }) { return <div className={`case-prose ${className}`} data-reveal>{children}</div>; }
export function Statement({ children, cite }) { return <blockquote className="case-statement" data-reveal><p>{children}</p>{cite && <footer>{cite}</footer>}</blockquote>; }
export function Split({ children, reverse = false, className = '' }) { return <div className={`case-split ${reverse ? 'is-reverse' : ''} ${className}`}>{children}</div>; }

// A genuine screenshot inside a device frame. frame: browser | phone | none.
export function Shot({ src, alt, caption, frame = 'browser', address, className = '', priority = false }) {
  return <figure className={`case-shot frame-${frame} ${className}`} data-reveal>
    <div className="shot-device" data-ui>
      {frame === 'browser' && <div className="shot-bar"><span/><span/><span/>{address && <em>{address}</em>}</div>}
      <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async"/>
    </div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

// Horizontal reel of screenshots; drag, wheel or keyboard.
export function Reel({ shots, label }) {
  const ref = useRef(null);
  const step = direction => ref.current?.scrollBy({ left: direction * ref.current.clientWidth * .8, behavior: 'smooth' });
  return <div className="case-reel" data-reveal>
    <div className="reel-track" ref={ref} tabIndex={0} role="region" aria-label={label}>{shots.map(shot => <Shot key={shot.src} {...shot}/>)}</div>
    <div className="reel-controls"><button type="button" onClick={() => step(-1)} aria-label="Previous screens">←</button><button type="button" onClick={() => step(1)} aria-label="Next screens">→</button></div>
  </div>;
}

// A decision the visitor can interrogate: every option opens its reasoning; the chosen one is marked.
export function Decision({ title, problem, options, chosen, children }) {
  const [open, setOpen] = useState(chosen);
  const active = options.find(option => option.id === open) || options[0];
  return <article className="case-decision" data-reveal>
    <h3>{title}</h3>
    <p className="decision-problem">{problem}</p>
    <div className="decision-options" role="tablist" aria-label={`Options for ${title}`}>
      {options.map(option => <button key={option.id} type="button" role="tab" aria-selected={open === option.id} data-chosen={option.id === chosen} onClick={() => setOpen(option.id)}>
        <span>{option.label}</span>{option.id === chosen && <em>Chosen</em>}
      </button>)}
    </div>
    <div className="decision-body" role="tabpanel" key={active.id}>
      <p>{active.body}</p>
      {active.cost && <p className="decision-cost"><strong>{active.id === chosen ? 'What it cost' : 'Why not'}</strong> {active.cost}</p>}
    </div>
    {children}
  </article>;
}

export function CodeNote({ file, language = 'js', code, caption }) {
  return <figure className="case-code" data-reveal>
    {file && <figcaption className="code-file">{file}</figcaption>}
    <pre><code data-language={language}>{code.trim()}</code></pre>
    {caption && <p className="code-caption">{caption}</p>}
  </figure>;
}

// What I did versus what the team or context provided.
export function Ledger({ mine, others, mineTitle = 'What I did', othersTitle = 'What was already there' }) {
  return <div className="case-ledger" data-reveal>
    <div className="ledger-mine"><h3>{mineTitle}</h3><ul>{mine.map(item => <li key={item}>{item}</li>)}</ul></div>
    {others && <div className="ledger-others"><h3>{othersTitle}</h3><ul>{others.map(item => <li key={item}>{item}</li>)}</ul></div>}
  </div>;
}

// A timeline the visitor scrubs; the selected moment expands.
export function Timeline({ items, label = 'Timeline' }) {
  const [index, setIndex] = useState(items.length - 1);
  const item = items[index];
  return <div className="case-timeline" data-reveal>
    <div className="timeline-track" role="tablist" aria-label={label}>
      {items.map((entry, i) => <button key={entry.date + entry.title} type="button" role="tab" aria-selected={i === index} onClick={() => setIndex(i)} style={{ '--i': i, '--n': items.length }}><span className="timeline-date">{entry.date}</span><span className="timeline-title">{entry.title}</span></button>)}
    </div>
    <div className="timeline-detail" role="tabpanel" key={index}><h3>{item.title}</h3><p>{item.body}</p></div>
  </div>;
}

// Large measured numbers. Only real, countable quantities.
export function Numbers({ items }) {
  return <dl className="case-numbers" data-reveal>{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd>{item.note && <p>{item.note}</p>}</div>)}</dl>;
}

function NextCase({ next }) {
  return <a className="case-next" href={`/work/${next.slug}/`}>
    <span className="next-label">Next case study</span>
    <span className="next-name">{next.name}</span>
    <span className="next-line">{next.line}</span>
    <span className="next-arrow" aria-hidden="true">→</span>
  </a>;
}
