// ─────────────────────────────────────────────────────────────────────────────
// Data contract for the shared NAAS content layer — the future CMS / DB model.
// Each schema is the canonical shape of one content "table". Pure data validated
// by these lives in ./data/*.json; long-form page bodies live in ./pages/*.md.
//
// Phase 0: documentation + types (not wired into the build). Enable runtime
// validation later by parsing each JSON through its schema.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from 'zod';

/** persons.json — presidium & members */
export const Person = z.object({
  name: z.string(),
  post: z.string(),
  photo: z.string(),
  phone: z.string(),
  bio: z.string(),
  group: z.enum(['leadership', 'members']),
  featured: z.boolean(),
});

/** institutes.json — наукові установи, згруповані за відділеннями */
export const Institute = z.object({
  nazva: z.string(),
  kerivnyk: z.string(),
  web: z.string(),
  email: z.string(),
  tel: z.string(),
  faks: z.string(),
  adresa: z.string(),
});
export const Division = z.object({
  viddilennia: z.string(),
  ustanovy: z.array(Institute),
});

/** contacts.json — єдиний запис контактів */
export const Contacts = z.object({
  address: z.string(),
  phone: z.string(),
  phone2: z.string(),
  email: z.string(),
  press_email: z.string(),
  press_phone: z.string(),
  fax: z.string(),
  edrpou: z.string(),
  edrpou_label: z.string(),
});

/** anonsy.json — анонси */
export const Anons = z.object({
  date: z.string(),
  title: z.string(),
  teaser: z.string(),
  image: z.string(),
  url: z.string(),
});

/** news.json — стрічка новин (також рендерить /novyny/[slug]) */
export const NewsItem = z.object({
  slug: z.string(),
  date: z.string(),
  tag: z.string(),
  title: z.string(),
  teaser: z.string(),
  image: z.string(),
  body: z.string(),
});

/** resources.json — ресурсні посилання на головній */
export const Resource = z.object({ name: z.string(), url: z.string() });

/** registries.json — реєстри документів (prozorist / publichna-informatsiia / ip …) */
export const RegItem = z.object({
  title: z.string(),
  ext: z.string(),
  href: z.string(),
  year: z.number(),
  sizeKB: z.number(),
  external: z.boolean().optional(),
});
export const Registry = z.object({
  key: z.string(),
  title: z.string(),
  route: z.string(),
  source_url: z.string(),
  count: z.number(),
  items: z.array(RegItem),
});

/** video.json — відеоматеріали */
export const VideoItem = z.object({ youtube: z.string(), title: z.string() });
/** elibrary.json — періодика е-бібліотеки */
export const ELibraryItem = z.object({ name: z.string(), src: z.string() });
/** agrolectures.json — агролекції */
export const AgrolectureItem = z.object({ title: z.string(), youtube: z.string() });

/** sections.json — дискретні контент-блоки, спільні для обох дизайнів */
export const Sections = z.object({
  publications: z.array(z.object({ title: z.string(), url: z.string(), note: z.string() })),
  officialDocs: z.array(z.object({ title: z.string(), note: z.string(), href: z.string().optional() })),
  innovationCatalog: z.object({ title: z.string(), note: z.string(), url: z.string() }),
});

/** documents.json — сирі документи реєстрів, згруповані за ключем (джерело для registries.json) */
export const Documents = z.record(z.string(), z.array(z.record(z.string(), z.unknown())));

// ── Inferred TypeScript types (value + type intentionally share a name) ──
export type Person = z.infer<typeof Person>;
export type Institute = z.infer<typeof Institute>;
export type Division = z.infer<typeof Division>;
export type Contacts = z.infer<typeof Contacts>;
export type Anons = z.infer<typeof Anons>;
export type NewsItem = z.infer<typeof NewsItem>;
export type Resource = z.infer<typeof Resource>;
export type RegItem = z.infer<typeof RegItem>;
export type Registry = z.infer<typeof Registry>;
export type VideoItem = z.infer<typeof VideoItem>;
export type ELibraryItem = z.infer<typeof ELibraryItem>;
export type AgrolectureItem = z.infer<typeof AgrolectureItem>;
export type Sections = z.infer<typeof Sections>;
export type Documents = z.infer<typeof Documents>;
