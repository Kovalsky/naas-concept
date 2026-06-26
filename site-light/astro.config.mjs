// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const HERO = process.env.HERO || 'v1';
const OUT_DIR = process.env.OUT_DIR || 'dist';

export default defineConfig({
  site: 'https://naas-portal-light-v1.pages.dev',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  outDir: `./${OUT_DIR}`,
  vite: {
    define: { 'import.meta.env.HERO': JSON.stringify(HERO) },
    resolve: {
      alias: { '@shared': fileURLToPath(new URL('../site/src', import.meta.url)) },
    },
    server: { fs: { allow: ['..'] } },
  },
});
