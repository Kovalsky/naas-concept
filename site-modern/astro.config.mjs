// @ts-check
import { defineConfig } from 'astro/config';

// Static output (default). Canonical host is new.naas.gov.ua (Mirohost —
// Ukrainian law requires gov.ua sites to be hosted in Ukraine);
// naas-portal-modern.pages.dev remains as a preview deployment.
export default defineConfig({
  site: 'https://new.naas.gov.ua',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
