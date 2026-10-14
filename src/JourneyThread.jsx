import React, { useLayoutEffect, useRef } from 'react';
import { buildThread, threadPointAtY } from './threadGeometry.js';

export default function JourneyThread({ enabled, reducedMotion, rootRef }) {
  const svgRef = useRef(null), pathRef = useRef(null), tipRef = useRef(null), stationsRef = useRef(null);
  useLayoutEffect(() => {
    if (!enabled) return;
    const root = rootRef.current, svg = svgRef.current;
    let geometry, layoutFrame = 0, paintFrame = 0, origin = 0, previous = -1, cancelled = false;
    const stations = [];
    // Offset coordinates ignore GSAP entrance transforms, keeping stations stable.
    function layoutTop(node) {
      let top = 0;
      while (node && node !== root) { top += node.offsetTop; node = node.offsetParent; }
      return top;
    }
    function paint() {
      paintFrame = 0;
      if (!geometry || document.hidden) return;
      const point = threadPointAtY(geometry.samples, reducedMotion ? Infinity : window.scrollY + window.innerHeight * .72 - origin);
      if (Math.abs(previous - point.length) < .2) return;
      previous = point.length;
      pathRef.current.style.strokeDashoffset = String(geometry.length - point.length);
      tipRef.current.setAttribute('transform', `translate(${point.x} ${point.y})`);
      stations.forEach(({ y, node }) => node.setAttribute('data-reached', String(point.y >= y)));
    }
    function schedulePaint() { if (!paintFrame) paintFrame = requestAnimationFrame(paint); }
    function measure() {
      layoutFrame = 0;
      if (cancelled) return;
      const rect = root.getBoundingClientRect();
      origin = rect.top + window.scrollY;
      const hero = root.querySelector('.hero'), action = root.querySelector('.hero-action');
      const heroRect = hero.getBoundingClientRect(), actionRect = action.getBoundingClientRect();
      const stops = ['.work-intro', '.workflow-heading', '.about-heading'].map(selector => layoutTop(root.querySelector(selector)) - 32);
      const contact = root.querySelector('.contact-row');
      const start = { x: actionRect.left - rect.left + actionRect.width / 2, y: heroRect.bottom - rect.top - 10 };
      geometry = buildThread({ width: rect.width, start, stops, end: layoutTop(contact) + contact.offsetHeight + 12 });
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${root.scrollHeight}`);
      svg.style.height = `${root.scrollHeight}px`;
      pathRef.current.setAttribute('d', geometry.d);
      pathRef.current.style.strokeDasharray = String(geometry.length);
      stations.length = 0;
      [...stationsRef.current.children].forEach((node, i) => {
        node.setAttribute('transform', `translate(${geometry.gutter} ${stops[i]})`);
        stations.push({ y: stops[i], node });
      });
      previous = -1;
      paint();
    }
    function scheduleMeasure() { if (!layoutFrame) layoutFrame = requestAnimationFrame(measure); }
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(root);
    root.querySelectorAll('.work-intro, .workflow-heading, .about-heading, .contact-row').forEach(node => observer.observe(node));
    window.addEventListener('scroll', schedulePaint, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    document.addEventListener('visibilitychange', schedulePaint);
    document.fonts?.ready.then(() => { if (!cancelled) scheduleMeasure(); });
    measure();
    return () => {
      cancelled = true; observer.disconnect(); cancelAnimationFrame(layoutFrame); cancelAnimationFrame(paintFrame);
      window.removeEventListener('scroll', schedulePaint); window.removeEventListener('resize', scheduleMeasure);
      document.removeEventListener('visibilitychange', schedulePaint);
    };
  }, [enabled, reducedMotion, rootRef]);
  if (!enabled) return null;
  return <svg className="journey-thread" ref={svgRef} aria-hidden="true" data-testid="journey-thread" preserveAspectRatio="none">
    <path ref={pathRef} className="journey-thread-ink" fill="none" strokeLinecap="round"/>
    <g ref={stationsRef}>{['Superforms', 'A wider story', 'Your next piece'].map(name => <g key={name} className="thread-station"><circle r="7"/><circle className="station-core" r="2"/><text x="18" y="4">{name}</text></g>)}</g>
    <g ref={tipRef} className="thread-tip"><circle r="3"/><circle r="7" fill="none" strokeWidth="1" opacity=".3"/></g>
  </svg>;
}
