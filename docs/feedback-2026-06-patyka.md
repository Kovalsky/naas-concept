# Stakeholder feedback — refinement tasks (2026-06-27)

Source: Telegram chat with Патика Микола Во… (NAAS side). Reference links provided:
- Authoritative history: https://logos-ukraine.com.ua/articles/natsionalna-akademiia-ahrarnykh-nauk-ukrayiny
- Google "Науковці" share pages (treated as drafts that themselves need correction)

## Feedback decoded (UA → intent)

1. **Modern period over-indexes the previous president; "history has moved on."**
   The current-era narrative should reflect the *current* president (Я. М. Гадзало, 2014–present), not the previous one (М. В. Зубець, 1996–2011). NB: stakeholder may be referring to the Google reference page, but the rule applies to our content too.
2. **History dates are inconsistent.** The academy has a centenary medal (≈100 yrs, origins 1918) *and* is "31 years old" (current form founded after the USSR collapse, 1990). Stakeholder: maybe don't strongly emphasise a single founding date. Our site currently says only "founded 22 May 1931," which matches neither framing cleanly.
3. **Logo brightness mismatch.** The emblem we use is duller/dimmer than the official one. Match official brightness, saturation and colours.
4. **"The design won't be only white, will it?"** Site reads as too white/monochrome. Add more colour / visual richness.
5. **Positive:** big effort, nice font, comfortable on mobile. Keep.
6. **Bar is high:** "scientists will examine every dot under a microscope" → accuracy + polish are critical.
7. **More feedback incoming:** native staff will send corrections; a "whole stack of papers" of recommendations exists. (Plus an unread cut-off "Прохання від Ануш Валеріївни" — request from VP Anush Balyan.)

## Authoritative dates (from logos-ukraine.com.ua)
- Origins: **1 Nov 1918** (Scientific Committee, Ministry of Land Affairs) → centenary basis
- All-Ukrainian Academy of Agric. Sciences: **22 May 1931**
- Re-established as UAAN (post-USSR): **Sept / Dec 1990** → "31 years" basis
- National status: **6 Jan 2010** (Decree №8/2010)
- Current president: **Я. М. Гадзало** (elected Aug 2014, re-elected 2019)

---

## Tasks

### A. Content / History accuracy (HIGH — scientists will scrutinise)
- [ ] **A1.** Rewrite the history block in `site/src/data/pages/naan-sohodni.md:3-5` to reconcile the dual lineage: present the 1918 heritage (centenary) *and* the 1990 modern re-establishment, without a single contradictory "founded in X" claim. Soften hard anniversary/age statements.
- [ ] **A2.** Update the "modern period / today" narrative to reflect current leadership and recent events, not the previous president. Decide with stakeholder whether to name the current president (Гадзало) and presidium.
- [ ] **A3.** Audit all date/anniversary mentions site-wide (hero, about, any "N років" copy) for the same inconsistency; align to the agreed framing.
- [ ] **A4.** Cross-check every history/structure fact against the logos-ukraine article (6 divisions, ~50 institutions — article says 10 nat. centers + 33 institutes + 7 stations; verify the "50" figure in `naan-sohodni.md:1`).

### B. Logo / brand assets (HIGH)
- [ ] **B1.** Obtain the official high-fidelity NAAS emblem from the stakeholder (vector/SVG ideally).
- [ ] **B2.** Replace `site/public/naas-emblem.png` (currently 69 KB, used in header/footer/favicon) with a version matching official brightness/saturation/colours. Compare side-by-side before shipping.
- [ ] **B3.** Re-check AI-generated hero emblem variants (`site/public/img/hero/emblem-*.jpg`) — they may not be brand-faithful; confirm with stakeholder whether to keep or drop.

### C. Visual design — reduce "all white" (MEDIUM)
- [ ] **C1.** Introduce more brand colour: colored section backgrounds (navy/gold), accent bands, richer headers — while keeping the formal institutional tone.
- [ ] **C2.** Review token usage in `site/src/styles/global.css` — palette is fine (navy #1E3A5F, gold #B8860B), but it's under-used; apply it more boldly across sections.
- [ ] **C3.** Get stakeholder direction on how much colour (a couple of mockup options to choose from).

### D. Cross-cutting QA / polish (MEDIUM)
- [ ] **D1.** Full copy proofread (Ukrainian) — typos, dates, names, titles.
- [ ] **D2.** Keep the current font + mobile layout (explicitly praised) — don't regress.

### E. Pending inputs (BLOCKED — need from stakeholder)
- [ ] **E1.** Get the full text of the cut-off "Прохання від Ануш Валеріївни" message.
- [ ] **E2.** Get the "stack of papers" with recommendations (digital copy) before deep content work.
- [ ] **E3.** Collect corrections promised from the academy's own staff.
