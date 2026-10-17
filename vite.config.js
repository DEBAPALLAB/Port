import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createVoiceSessionHandler } from './server/voiceSession.js';

function voiceSessionApi() {
  return {
    name:'portfolio-voice-session',
    configureServer(server) {
      const handler=createVoiceSessionHandler({getEnv:()=>({...process.env,...loadEnv(server.config.mode,server.config.envDir,'')})});
      server.middlewares.use('/api/voice-session',(req,res)=>handler(req,res));
    },
  };
}

// Multi-page build: the journey at / and one page per case study at /work/<slug>/.
const cases = existsSync('work') ? readdirSync('work').filter(slug => existsSync(`work/${slug}/index.html`)) : [];
const input = { main: resolve('index.html'), about: resolve('about/index.html'), ...Object.fromEntries(cases.map(slug => [`work-${slug}`, resolve(`work/${slug}/index.html`)])) };

export default defineConfig({
  plugins: [react(),voiceSessionApi()],
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
