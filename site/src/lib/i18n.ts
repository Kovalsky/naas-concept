// ============================================================
// UI string dictionary (interface chrome only — NOT page content).
// Used by the <T> component and the language toggle. Body content
// stays Ukrainian for V1; only chrome switches uk ⇄ en.
// ============================================================
export type Lang = 'uk' | 'en';

export const STRINGS: Record<string, { uk: string; en: string }> = {
  // top navigation
  'nav.today': { uk: 'НААН сьогодні', en: 'NAAS Today' },
  'nav.structure': { uk: 'Структура', en: 'Structure' },
  'nav.training': { uk: 'Атестація та кадри', en: 'Training & Certification' },
  'nav.transparency': { uk: 'Прозорість', en: 'Transparency' },
  'nav.news': { uk: 'Новини', en: 'News' },
  'nav.contacts': { uk: 'Контакти', en: 'Contacts' },

  // chrome / utility
  'ui.a11y': { uk: 'Для людей з вадами зору', en: 'For people with visual impairments' },
  'ui.menu': { uk: 'Меню', en: 'Menu' },
  'ui.search.title': { uk: 'Пошук по порталу', en: 'Portal search' },
  'ui.search.ph': { uk: 'Пошук розділів, новин…', en: 'Search sections, news…' },
  'ui.search.empty': { uk: 'Нічого не знайдено.', en: 'Nothing found.' },
  'ui.crumb.home': { uk: 'Головна', en: 'Home' },

  // buttons
  'btn.more': { uk: 'Детальніше', en: 'More' },
  'btn.all': { uk: 'Усі', en: 'All' },
  'btn.open': { uk: 'Перейти', en: 'Open' },
  'btn.download': { uk: 'Завантажити', en: 'Download' },
  'btn.downloadPdf': { uk: 'Завантажити PDF', en: 'Download PDF' },
  'btn.downloadStatute': { uk: 'Завантажити Статут (PDF)', en: 'Download Statute (PDF)' },
  'btn.submit': { uk: 'Надіслати', en: 'Submit' },
  'btn.fullText': { uk: 'Повний текст', en: 'Full text' },

  // home sections
  'home.todayKicker': { uk: 'НААН сьогодні', en: 'NAAS Today' },
  'home.factFounded': { uk: 'рік заснування', en: 'year founded' },
  'home.factDivisions': { uk: 'наукових відділень', en: 'research divisions' },
  'home.factInstitutions': { uk: 'наукових установ', en: 'research institutions' },
  'home.sectionsKicker': { uk: 'Розділи порталу', en: 'Portal sections' },
  'home.sectionsTitle': { uk: 'Основні розділи', en: 'Main Sections' },
  'home.newsTitle': { uk: 'Новини', en: 'News' },
  'home.deptsTitle': { uk: 'Новини відділень', en: 'Division News' },
  'home.deptsFeed': {
    uk: 'Стрічка формується автоматично з новин наукових відділень. Реалізація — у версії з CMS (V2).',
    en: 'This feed is generated automatically from research-division news. Implementation — in the CMS version (V2).',
  },
  'home.announceTitle': { uk: 'Анонси', en: 'Announcements' },
  'home.resourcesKicker': { uk: 'Ресурси', en: 'Resources' },
  'home.resourcesTitle': { uk: 'Бібліотека, відео та видання', en: 'Library, Video & Publications' },
  'home.externalKicker': { uk: 'Зовнішні ресурси', en: 'External resources' },
  'home.externalTitle': { uk: 'Офіційні та партнерські ресурси', en: 'Official & Partner Resources' },
  'home.statuteLink': { uk: 'Статут НААН', en: 'NAAS Statute' },
  'home.presidiumLink': { uk: 'Президія НААН', en: 'NAAS Presidium' },

  // showcase card titles
  'show.structure': { uk: 'Структура Академії', en: 'Academy Structure' },
  'show.training': { uk: 'Атестація та кадри', en: 'Training & Certification' },
  'show.transparency': { uk: 'Прозорість', en: 'Transparency' },
  'show.publicInfo': { uk: 'Публічна інформація', en: 'Public Information' },
  'show.youngSci': { uk: 'Рада молодих вчених', en: 'Young Scientists Council' },
  'show.ip': { uk: 'Інтелектуальна власність', en: 'Intellectual Property' },

  // partners
  'partners.label': { uk: 'Партнерські та державні портали', en: 'Partner & Government Portals' },

  // footer
  'footer.contacts': { uk: 'Контакти', en: 'Contacts' },
  'footer.sections': { uk: 'Розділи', en: 'Sections' },
  'footer.documents': { uk: 'Документи', en: 'Documents' },
  'footer.resources': { uk: 'Ресурси', en: 'Resources' },
  'footer.s.today': { uk: 'НААН сьогодні', en: 'NAAS Today' },
  'footer.s.structure': { uk: 'Структура Академії', en: 'Academy Structure' },
  'footer.s.training': { uk: 'Атестація та кадри', en: 'Training & Certification' },
  'footer.s.transparency': { uk: 'Прозорість', en: 'Transparency' },
  'footer.s.news': { uk: 'Новини', en: 'News' },
  'footer.d.statute': { uk: 'Статут НААН', en: 'NAAS Statute' },
  'footer.d.publicInfo': { uk: 'Публічна інформація', en: 'Public Information' },
  'footer.d.procurement': { uk: 'Публічні закупівлі', en: 'Public Procurement' },
  'footer.d.reports': { uk: 'Звіти про діяльність', en: 'Activity Reports' },
  'footer.d.anticorr': { uk: 'Запобігання корупції', en: 'Anti-corruption' },
  'footer.r.elib': { uk: 'Е-Бібліотека', en: 'E-Library' },
  'footer.r.video': { uk: 'Відео', en: 'Video' },
  'footer.r.agrolectures': { uk: 'AGROLECTURES', en: 'AGROLECTURES' },
  'footer.r.youngSci': { uk: 'Рада молодих вчених', en: 'Young Scientists Council' },
  'footer.r.ip': { uk: 'Інтелектуальна власність', en: 'Intellectual Property' },

  // contacts page
  'contacts.address': { uk: 'Адреса', en: 'Address' },
  'contacts.presidium': { uk: 'Президія', en: 'Presidium' },
  'contacts.press': { uk: 'Прес-служба', en: 'Press Office' },
  'contacts.details': { uk: 'Реквізити', en: 'Details' },
  'contacts.prozorroProfile': { uk: 'Профіль Prozorro', en: 'Prozorro Profile' },
};

export const t = (k: string): string => STRINGS[k]?.uk ?? k;
