import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Multi-page build: the journey at / and one page per case study at /work/<slug>/.
const cases = existsSync('work') ? readdirSync('work').filter(slug => existsSync(`work/${slug}/index.html`)) : [];
const input = { main: resolve('index.html'), about: resolve('about/index.html'), ...Object.fromEntries(cases.map(slug => [`work-${slug}`, resolve(`work/${slug}/index.html`)])) };

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input,
      output: {
        manualChunks(id) {
          if (id.includes('/three/')) return 'three';
          if (id.includes('/gsap/')) return 'motion';
        },
      },
    },
  },
});
