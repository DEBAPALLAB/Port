// The six PRD data files, read at build time. Each page is /work/prd-<slug>/.
const modules = import.meta.glob('./data/*.js', { eager: true });
export const PRDS = Object.values(modules).map(module => module.default).filter(Boolean).sort((a, b) => a.number - b.number);
export const pageSlug = data => `prd-${data.slug}`;
export const pageHref = data => `/work/${pageSlug(data)}/`;
export const bySlug = slug => PRDS.find(item => item.slug === slug);
