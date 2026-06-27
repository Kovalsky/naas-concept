// ============================================================
// Central route map + navigation. Every link in the site is
// sourced from here so that no menu/footer/card link can be dead.
// ============================================================

export const ROUTES = {
  home: '/',
  today: '/naan-sohodni',
  statute: '/statut',
  presidium: '/naan-sohodni#prezidiya',
  rishennia: '/naan-sohodni/rishennia', // ТЗ placeholder
  structure: '/struktura',
  training: '/atestatsiia',
  transparency: '/prozorist',
  maynovi: '/prozorist/maynovi',
  dostup: '/prozorist/dostup',
  anticorr: '/prozorist/zapobihannia-koruptsii', // ТЗ placeholder
  publicInfo: '/publichna-informatsiia', // ТЗ placeholder
  youngSci: '/rada-molodykh',
  ip: '/intelektualna-vlasnist',
  news: '/novyny',
  anonsy: '/anonsy',
  contacts: '/kontakty',
  publishing: '/vydavnycha-diyalnist',
  officialDocs: '/ofitsiyni-dokumenty',
  // Resource sections migrated from the old site into native pages.
  eLibrary: '/e-biblioteka',
  videoPage: '/video',
  agrolectures: '/agrolectures',
} as const;

// External targets (open real destinations per ТЗ).
export const EXTERNAL = {
  reports: 'https://www.agroscience-publishing.org.ua/books/',
  prozorro: 'https://prozorro.gov.ua/',
  video: 'https://www.youtube.com/results?search_query=Національна+академія+аграрних+наук+України',
  // naas.gov.ua is HTTP-only (no valid TLS); these paths return 200 over http.
  eLib: 'http://naas.gov.ua/content/literatura/',
  agrolectures: 'http://naas.gov.ua/Agrolectures/',
  statutePdf: '/docs/statut_naan_2021.pdf',
} as const;

// Main header navigation (6 items, matching the V3 menu). `k` = i18n key.
export const NAV: { label: string; href: string; k: string }[] = [
  { label: 'НААН сьогодні', href: ROUTES.today, k: 'nav.today' },
  { label: 'Структура', href: ROUTES.structure, k: 'nav.structure' },
  { label: 'Атестація та кадри', href: ROUTES.training, k: 'nav.training' },
  { label: 'Прозорість', href: ROUTES.transparency, k: 'nav.transparency' },
  { label: 'Новини', href: ROUTES.news, k: 'nav.news' },
  { label: 'Контакти', href: ROUTES.contacts, k: 'nav.contacts' },
];

// «Основні розділи» showcase — all 6 cards wired to real routes.
export const SHOWCASE: { title: string; desc: string; href: string; k: string }[] = [
  { title: 'Структура Академії', desc: 'Наукові відділення та підпорядковані установи з контактами', href: ROUTES.structure, k: 'show.structure' },
  { title: 'Атестація та кадри', desc: 'Аспірантура, докторантура та державна атестація наукових кадрів', href: ROUTES.training, k: 'show.training' },
  { title: 'Прозорість', desc: 'Закупівлі Prozorro, майно та оренда, антикорупція, доступ до інформації', href: ROUTES.transparency, k: 'show.transparency' },
  { title: 'Публічна інформація', desc: 'Публічна інформація та набори даних розпорядника', href: ROUTES.publicInfo, k: 'show.publicInfo' },
  { title: 'Рада молодих вчених', desc: 'Спільнота та ініціативи молодих науковців НААН', href: ROUTES.youngSci, k: 'show.youngSci' },
  { title: 'Інтелектуальна власність', desc: 'Об’єкти права інтелектуальної власності академії', href: ROUTES.ip, k: 'show.ip' },
];

// Footer columns.
export const FOOTER = {
  sections: [
    { label: 'НААН сьогодні', href: ROUTES.today, k: 'footer.s.today' },
    { label: 'Структура Академії', href: ROUTES.structure, k: 'footer.s.structure' },
    { label: 'Атестація та кадри', href: ROUTES.training, k: 'footer.s.training' },
    { label: 'Прозорість', href: ROUTES.transparency, k: 'footer.s.transparency' },
    { label: 'Новини', href: ROUTES.news, k: 'footer.s.news' },
    { label: 'Видавнича діяльність', href: ROUTES.publishing, k: 'footer.s.publishing' },
  ],
  documents: [
    { label: 'Статут НААН', href: ROUTES.statute, k: 'footer.d.statute' },
    { label: 'Публічна інформація', href: ROUTES.publicInfo, k: 'footer.d.publicInfo' },
    { label: 'Публічні закупівлі', href: EXTERNAL.prozorro, external: true, k: 'footer.d.procurement' },
    { label: 'Звіти про діяльність', href: ROUTES.officialDocs, k: 'footer.d.reports' },
    { label: 'Запобігання корупції', href: ROUTES.anticorr, k: 'footer.d.anticorr' },
  ],
  resources: [
    { label: 'Е-Бібліотека', href: ROUTES.eLibrary, k: 'footer.r.elib' },
    { label: 'Відео', href: ROUTES.videoPage, k: 'footer.r.video' },
    { label: 'AGROLECTURES', href: ROUTES.agrolectures, k: 'footer.r.agrolectures' },
    { label: 'Рада молодих вчених', href: ROUTES.youngSci, k: 'footer.r.youngSci' },
    { label: 'Інтелектуальна власність', href: ROUTES.ip, k: 'footer.r.ip' },
  ],
} as const;

export const PLACEHOLDER_TEXT =
  'Розділ у підготовці. Матеріали з’являться найближчим часом.';

// Official state portals (ТЗ partner links) — sober, no marketing styling.
export const PARTNERS: { label: string; href: string }[] = [
  { label: 'Президент України', href: 'https://www.president.gov.ua/' },
  { label: 'Урядовий портал', href: 'https://www.kmu.gov.ua/' },
  { label: 'Верховна Рада України', href: 'https://www.rada.gov.ua/' },
  { label: 'Міністерство аграрної політики', href: 'https://minagro.gov.ua/' },
];

// Static search index (page/section titles) for the header search.
// News items are appended at runtime from the content collection.
export const SEARCH_INDEX: { title: string; href: string }[] = [
  { title: 'Головна', href: ROUTES.home },
  { title: 'НААН сьогодні', href: ROUTES.today },
  { title: 'Статут НААН', href: ROUTES.statute },
  { title: 'Президія НААН', href: ROUTES.presidium },
  { title: 'Рішення та Постанови Президії', href: ROUTES.today + '#rishennia' },
  { title: 'Структура Академії', href: ROUTES.structure },
  { title: 'Атестація та підготовка кадрів', href: ROUTES.training },
  { title: 'Прозорість', href: ROUTES.transparency },
  { title: 'Майнові питання', href: ROUTES.maynovi },
  { title: 'Доступ до публічної інформації', href: ROUTES.dostup },
  { title: 'Запобігання корупції', href: ROUTES.anticorr },
  { title: 'Публічна інформація', href: ROUTES.publicInfo },
  { title: 'Рада молодих вчених', href: ROUTES.youngSci },
  { title: 'Інтелектуальна власність', href: ROUTES.ip },
  { title: 'Новини', href: ROUTES.news },
  { title: 'Анонси', href: ROUTES.anonsy },
  { title: 'Контакти', href: ROUTES.contacts },
  { title: 'Видавнича діяльність', href: ROUTES.publishing },
  { title: 'Офіційні документи', href: ROUTES.officialDocs },
  { title: 'Е-Бібліотека', href: ROUTES.eLibrary },
  { title: 'Відео', href: ROUTES.videoPage },
  { title: 'AGROLECTURES', href: ROUTES.agrolectures },
];
