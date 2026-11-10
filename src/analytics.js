import posthog from 'posthog-js';

// PostHog is off until a project key is set (VITE_PUBLIC_POSTHOG_KEY). Every page entry imports this file once.
const KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const enabled = Boolean(KEY) && typeof window !== 'undefined' && !import.meta.env.DEV_DISABLE_ANALYTICS;

function section() {
  const [, first = 'home', second] = location.pathname.split('/');
  if (first === 'work') return { section: second ? 'case' : 'work-index', case_slug: second || null };
  return { section: first || 'home', case_slug: null };
}

if (enabled && !window.__posthogReady) {
  window.__posthogReady = true;
  posthog.init(KEY, {
    api_host: '/ingest',
    ui_host: HOST.includes('eu.') ? 'https://eu.posthog.com' : 'https://us.posthog.com',
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    capture_exceptions: true,
    capture_performance: true,
    disable_session_recording: false,
    session_recording: { maskAllInputs: true, maskTextSelector: '[data-ph-mask]' },
    enable_heatmaps: true,
    respect_dnt: true,
    opt_out_useragent_filter: location.search.includes('ph_test'),
    loaded: instance => {
      if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') instance.opt_out_capturing();
      instance.register(section());
      watchChapters(instance);
      watchScrollDepth(instance);
    },
  });
}

// One event per chapter the reader actually reaches, and one per 25% of the page.
function watchChapters(instance) {
  const seen = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const name = entry.target.getAttribute('data-chapter');
      if (!name || seen.has(name)) continue;
      seen.add(name);
      instance.capture('chapter_viewed', { chapter: name, id: entry.target.id });
    }
  }, { threshold: 0.35 });
  const attach = () => document.querySelectorAll('[data-chapter]').forEach(el => observer.observe(el));
  attach();
  new MutationObserver(attach).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
}

function watchScrollDepth(instance) {
  const marks = new Set();
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const depth = Math.floor(scrollY / max * 4) * 25;
    if (depth > 0 && !marks.has(depth)) { marks.add(depth); instance.capture('scroll_depth', { percent: depth }); }
  }, { passive: true });
}

// For deliberate product events, for example track('inbox_sorted', { sorted: true }).
export function track(event, props) { if (enabled) posthog.capture(event, props); }
export { posthog };
