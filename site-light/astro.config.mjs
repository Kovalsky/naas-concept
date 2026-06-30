// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';

const HERO = process.env.HERO || 'v1';
const OUT_DIR = process.env.OUT_DIR || 'dist';
// Deploy domain (canonical URLs, OG, sitemap). Override per-deploy via SITE_URL.
const SITE = process.env.SITE_URL || 'https://naas-portal-light.pages.dev';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  outDir: `./${OUT_DIR}`,
  integrations: [sitemap()],
  vite: {
    define: { 'import.meta.env.HERO': JSON.stringify(HERO) },
    resolve: {
      alias: { '@shared': fileURLToPath(new URL('../site/src', import.meta.url)) },
    },
    server: { fs: { allow: ['..'] } },
  },
});
