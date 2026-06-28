import {
  ROUTES, NAV, EXTERNAL, PARTNERS,
  SEARCH_INDEX as RAW_SEARCH_INDEX, SHOWCASE,
  FOOTER as RAW_FOOTER, PLACEHOLDER_TEXT,
} from '@content/site';

// site-light ships fewer pages than the heavy `site`. The E-Бібліотека / Відео /
// AGROLECTURES "resources" exist only as external platforms in this build, so the
// shared internal routes (/e-biblioteka, /video, /agrolectures) would 404. Remap them
// to their real external URLs — the same destinations the homepage E-resources block
// uses — so the footer and header search never link to a missing page.
const EXT_REMAP: Record<string, string> = {
  [ROUTES.eLibrary]: EXTERNAL.eLib,
  [ROUTES.videoPage]: EXTERNAL.video,
  [ROUTES.agrolectures]: EXTERNAL.agrolectures,
};

const FOOTER = {
  ...RAW_FOOTER,
  resources: RAW_FOOTER.resources.map((r) =>
    EXT_REMAP[r.href] ? { ...r, href: EXT_REMAP[r.href], external: true } : r
  ),
};

const SEARCH_INDEX = RAW_SEARCH_INDEX.map((s) =>
  EXT_REMAP[s.href] ? { ...s, href: EXT_REMAP[s.href], external: true } : s
);

export { ROUTES, NAV, EXTERNAL, PARTNERS, SHOWCASE, PLACEHOLDER_TEXT, FOOTER, SEARCH_INDEX };
