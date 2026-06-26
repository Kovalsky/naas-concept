// @ts-check
import { defineConfig } from 'astro/config';

// Static output (default) — deployable to Cloudflare Pages as a static site.
export default defineConfig({
  site: 'https://naas-portal-new.pages.dev',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
