# NAAS Light — Consolidated Requirements

**Date:** 2026-06-26
**Status:** Reference (single source of the whole picture)
**Relationship:** Complements — does not replace — the implementation design spec
[`2026-06-26-naas-light-portal-redesign-design.md`](./2026-06-26-naas-light-portal-redesign-design.md)
and the foundation plan [`../plans/2026-06-26-naas-light-foundation.md`](../plans/2026-06-26-naas-light-foundation.md).

## Overview

A new, **lighter-feeling** parallel version of the NAAS portal (National Academy of Agrarian Sciences of Ukraine) — same content as today, a new visual design system, living on its own domain(s) while the current "gravitas" site stays untouched. The institution is positioned **science-first** (a research academy, not a business or a Diia-style e-service); the agribusiness/farmer audience is served, but secondary. This document gathers **every requirement, decision and preference the user stated in this session**, separating the one **strict** part of the technical brief (the content blocks and their names) from the many points the user **decided this session** because the TZ left them open.

---

## Table of Contents

1. [Goal & Positioning](#1-goal--positioning)
2. [Audience](#2-audience)
3. [STRICT requirements (from the TZ)](#3-strict-requirements-from-the-tz) — content blocks + exact names
4. [Decided this session (TZ non-strict points)](#4-decided-this-session-tz-non-strict-points)
5. [Design system & direction](#5-design-system--direction)
6. [The two variants (V1 / V3)](#6-the-two-variants-v1--v3)
7. [Content & photo policy](#7-content--photo-policy)
8. [Architecture & deployment](#8-architecture--deployment)
9. [Frontend quality constraints (kept from the TZ)](#9-frontend-quality-constraints-kept-from-the-tz)
10. [How work should be done (process expectations)](#10-how-work-should-be-done-process-expectations)
11. [Source materials](#11-source-materials)

---

## 1. Goal & Positioning

- Build a **lighter** version of the existing site — *same content, new style* — that feels less heavy/strict than the current "gravitas" design, so it is more approachable for farmers and agribusiness.
- It is an **additional** site on a **separate domain**; the **current version must not be changed**.
- **Positioning is science-first.** NAAS is first and foremost a **scientific / research organization**; making science is the main goal. The agrarian-business and farmer audience is **secondary** — served *underneath* the scientific identity, not competing with it.
- **Explicitly NOT** a Diia / govtech-app look. (This is why the all-sans state font was rejected — see §5.)

## 2. Audience

Primary: scientists, lecturers, postgraduates / students. Secondary: agribusiness, farmers, agrarian producers, state bodies and communities, citizens. The lighter design must remain credible for scientists while being easy and inviting for the practical (farmer/business) audience.

---

## 3. STRICT requirements (from the TZ)

> The TZ (`NAAS_TZ_v9 (lite).docx` path: /Users/falco/dev/naas_github_pages/docs/NAAS_TZ_v9 (lite).docx) is an older stakeholder document and **most of it is negotiable**. The **only strict part** is the **content blocks and their exact names** — implement *exactly* those sections, *no more, no less*, and **do not rename or invent** sections (use the TZ names verbatim or very close). Their **order is NOT strict** (see §4).

### 3.1 Structural content blocks (exact names)

- **НААН сьогодні**
- **Статут НААН** — current edition of the Statute (downloadable PDF)
- **Керівництво та Президія** — composition of the Presidium, biographies, photos, areas of responsibility (President, Vice-presidents, Chief Scientific Secretary)
- **Рішення та Постанови Президії** — archive of official orders and resolutions
- **Звіти про діяльність** — annual activity reports
- **Структура Академії** — by scientific divisions + full list of subordinate institutions, with fields: *Назва, керівник, фото, лого, web, email, тел, факс, про установу* (migrated from the existing site)
- **Атестація та підготовка кадрів**, with sub-blocks:
  - **Підготовка наукових кадрів (Аспірантура / Докторантура)** — licenses, ОНП & curricula, admission rules, tuition cost & state-order volumes
  - **Атестація наукових кадрів (Спеціалізовані вчені ради)** — defense notices, dissertation texts / autoreferats / opponent reviews, composition of one-time and standing councils
  - **Наукові видання НААН** — registry of professional journals (MON category А/Б, links, requirements)
  - **Державна атестація та акредитація** — state attestation results of institutions (qualification groups)
- **Тендери та Прозорість**, with sub-blocks:
  - **Публічні закупівлі (Тендери)** — integrated Prozorro widget / direct link by EDRPOU + annual procurement plan + justification (КМУ №710)
  - **Майнові питання та Оренда** — links to Prozorro.Продажі
  - **Запобігання корупції** — anti-corruption program, authorized person's contacts, whistleblower channels
  - **Доступ до публічної інформації** — request forms/templates, appeal procedure
- **Публічна інформація** (block stays as-is; tenders & public-info are moved out of here)
- **Рада молодих вчених** (unchanged)
- **Інтелектуальна власність** (unchanged)
- **Контакти** (at the bottom) and **Пошук** (at the top)

### 3.2 Other strict homepage elements

- **3 news ribbons** in the NAN format: **Новини**, **Новини відділень**, **Анонси**.
- **Е-ресурси**: **Е-Бібліотека**, **Відео**, **Agricultures**.
- **Посилання на 4 сайти** (4 site links).
- **Логотип** of the academy at the top; **пошук** at the top; **контакти** at the bottom.

---

## 4. Decided this session (TZ non-strict points)

Points the TZ raised but left open, **resolved by the user in this session**:

| Topic | Decision (user's framing) |
|---|---|
| **Block order** | **Not mandatory** — order/arrangement is a free design choice to create the intended feeling. Use a **science-first arrangement**. |
| **NAN (`nan.gov.ua`) design reference** | **Non-mandatory** — it is just a reference from one stakeholder, not a requirement. |
| **e-Ukraine font (Mincifra)** | **Not mandatory → rejected.** It is a govtech/Diia voice and a sans-only state font; it loses the scholarly character. Use a self-hosted serif+sans system instead (see §5). |
| **CMS / WordPress / RBAC / 2FA / backups / live Prozorro integration** | **Deferred** — this effort is a **frontend redesign now (Astro)**; the CMS and security backend are a later phase. |
| **«Наукові розробки та пропозиції» catalogue** | **In scope** — migrate it (it lives under **Публічна інформація** on the old site). |
| **Hero slogan / headline** | **No invented text.** Use the **verbatim old-site hero banner** wording (see §7). |
| **Both hero treatments** | The user wants **BOTH** the no-photo and the photo-slider hero — each on its own domain (see §6). |

---

## 5. Design system & direction

- **Direction:** "**fresh take, same spirit**" of the reference mockup `v3-hybrid.html` — **light, photography-driven, with varied per-section treatments** — not a 1:1 port. Keep only the lighter, more approachable *feeling* and the existing palette.
- **Palette (kept):** navy **`#1E3A5F`** (+ deep navy `#0E1F35`) and wheat-gold **`#B8860B`**. Navy is used for accents / hero wash / footer, **not** heavy full-blocks.
- **Typography (self-hosted, no external CDN):** **Lora** (display serif, headings at lighter weight), **Inter** (body), **JetBrains Mono** (labels / dates / stats). e-Ukraine rejected (see §4).
- **Each content block must be VISUALLY DISTINCT** — not a monotonous uniform card grid. Use a different treatment per block (e.g. photo division cards, editorial news, date-block events, presidium portraits, attestation tiles, document rows, resource cards). This was a key correction: the body must feel as rich and varied as `v3-hybrid`, not boring.
- **News section must be an editorial composition** (featured lead + scannable list), **not** a boring uniform grid — even the old site's news is more interesting than a plain grid.
- **Анонси** rendered as a **«Найближчі події»** date-block component (per `v3-hybrid`).
- **Новини відділень** has **no real data yet** → shown as a **clearly-marked placeholder** (e.g. "ЗРАЗОК / демо-наповнення"); real per-department aggregation is a CMS-phase item.
- **Alignment:** everything aligns to **one consistent gutter** (no elements "moved a bit").
- **Logo:** the **real NAAS emblem** in the header (not a placeholder).
- **Header** carries the verbatim slogan (see §7).
- **Photos must be curated with care** — pick images that fit the design and read well (the "Про Академію" image was called out as ugly and must be chosen deliberately, with cohesive treatment).

---

## 6. The two variants (V1 / V3)

- **BOTH variants are built on the SAME new light design system.** They differ **only in the hero**. The body (all blocks below the hero) is identical and is the rich light design.
- **V1 — typographic hero (no photo).** Must be **unmistakably the new light system** — it must **NOT** resemble / copy the original gravitas hero.
- **V3 — photo-slider hero** (photographic hero with navy wash).
- Each variant is deployed to **its own domain**.
- **Naming:** the current site = **"NAAS Portal Gravitas"**; the new builds = **`naas-portal-light-v1`** and **`naas-portal-light-v3`**.

---

## 7. Content & photo policy

- **HARD RULE — no invented content.** Do **not** invent slogans, headlines, CTAs, or section labels. Every text string maps to **real / sourced content** or a **clearly-marked placeholder**. Scientists scrutinise every word, so fabricated text is a liability.
- **Hero copy = verbatim old-site banner** (`naas.gov.ua` `region-banner` / `.slogan`):
  - H1: **«Національна академія аграрних наук України»**
  - Slogan/subhead: **«Науково-методичний і координаційний центр з наукових проблем розвитку АПК України»**
  - The **header** also carries this slogan verbatim.
- **Strict-real for text content and many-instance content.** All text (block names, news, anonsy, persons, institutes, contacts) comes from the real migrated data. Content with many instances each carrying its own real media — e.g. the **100+ news items, each with its own photo** — must use the **real photos**; these are **never generated or substituted**.
- **Decorative imagery may be stock / purchased.** For hero / section decoration (hero, "Про Академію", division cards) stock or purchased stock photos are allowed, chosen carefully and treated cohesively (e.g. navy tint) so they fit the palette.
- **Placeholders must be visibly marked** so stakeholders know that content still needs to be mined/supplied (e.g. Новини відділень).
- **Real data facts (confirmed):** founded **1931**; **6 відділень**; **50 установ**; EDRPOU **00024360**; address «01010, Київ, вул. Михайла Омеляновича-Павленка, 9»; news 9 items (w/ photos); anonsy 4 (w/ photos); leadership 7 (w/ photos + bios).

---

## 8. Architecture & deployment

- **Two/three parallel sites sharing ONE content source** so they never drift; the **current site is never modified**.
- **Frontend now in Astro** (static), deployed to Cloudflare Pages. New project `site-light/` consumes the existing content (`../site/src/data`, shared `public` assets) — no copies.
- Both V1 and V3 come from the same light codebase, differing only in the hero, each deployed to its own Cloudflare Pages project / domain.
- CMS / multi-editor RBAC / 2FA / backups / live Prozorro integration are **out of scope for now** (later phase).

---

## 9. Frontend quality constraints (kept from the TZ)

- **Bilingual UA / EN** (the structure may differ between languages); default Ukrainian.
- **Accessibility: WCAG 2.1 AA** — contrast ≥ 4.5:1, keyboard navigation, ARIA, alt text, visible focus.
- **Performance: Google PageSpeed ≥ 90** (mobile **and** desktop) → no Tailwind/CSS CDN; **self-hosted fonts**; **WebP + lazy-load + srcset**; hero image **≥ 1920×1080**; reserve image dimensions (avoid CLS).
- **SEO:** Schema.org (**Article, Person, Dataset**), Open Graph, **sitemap.xml**, **robots.txt**.
- **Analytics:** **GA4** tag + goals.
- **Forms:** **Cloudflare Turnstile** on the contact/inquiry form.
- **Security via Cloudflare:** HTTPS / TLS, WAF, DDoS protection (backend security items belong to the later phase).
- Cross-browser: latest 2 of Chrome / Firefox / Safari / Edge; responsive ≤767 / 768–1023 / 1024+.

---

## 10. How work should be done (process expectations)

The user explicitly asked for these working principles:

1. **Do not invent UI elements and then ask the user to justify them.** If something isn't backed by real content or a real destination, it shouldn't be added; if a gap is genuine, mark it as a placeholder — don't fabricate and then quiz the user.
2. **Think through every interaction.** For each link/button, know **where it points, what behavior it has, and what data backs it** — annotate interactive elements with *target · behavior · data source*, and distinguish real (spec'd) behavior from decorative pattern.
3. **Both variants must use the new light design system.** The no-photo (V1) variant must **not** resemble the original gravitas site — if it looks copied from the current site, that's wrong.
4. **Strict means strict, free means free.** Implement exactly the TZ content blocks/names (no additions, no renames); freely arrange order and visual treatment to create the intended science-first, light feeling.

---

## 11. Source materials

- **TZ (technical brief):** `NAAS_TZ_v9 (lite).docx` — older stakeholder doc; only the **content blocks/names** are strict.
- **Old site (content source & verbatim wording):** `naas.gov.ua` (HTTP, windows-1251; self-signed TLS) — hero banner slogan, full menu/IA, 100+ news with photos.
- **Reference mockup (feel):** `v3-hybrid.html` (repo root; mirror `kovalsky.github.io/naas-concept/v3-hybrid.html`).
- find TZ at /Users/falco/dev/naas_github_pages/docs/NAAS_TZ_v9 (lite).docx
