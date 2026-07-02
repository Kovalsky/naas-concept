import { ROUTES, EXTERNAL } from './site';
import contacts from './data/contacts.json';

export interface ProzoristCard {
  title: string;
  desc: string;
  href: string;
  external?: boolean;
  icon: string;
}

// Transparency-hub cards. Content is canonical (= gravitas's set). `icon` is used by
// designs that render iconified cards (light) and ignored by those that don't (gravitas),
// so a single list serves both.
export const PROZORIST_CARDS: ProzoristCard[] = [
  {
    title: 'Публічні закупівлі (Prozorro)',
    desc: `Профіль розпорядника у системі Prozorro, ЄДРПОУ ${contacts.edrpou}.`,
    href: EXTERNAL.prozorro,
    external: true,
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  },
  {
    title: 'Річні плани закупівель',
    desc: 'Архів річних планів публічних закупівель Академії.',
    href: '/prozorist/tendery',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  },
  {
    title: 'Майнові питання',
    desc: 'Інформація про майно, що пропонується до безоплатної передачі та оренди.',
    href: ROUTES.maynovi,
    icon: '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-3"/><path d="M9 9h.01M9 12h.01M9 15h.01M9 18h.01"/>',
  },
  {
    title: 'Доступ до публічної інформації',
    desc: 'Нормативно-правова база, запити та набори даних розпорядника інформації.',
    href: ROUTES.dostup,
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  },
  {
    title: 'Запобігання корупції',
    desc: 'Антикорупційні заходи та документи.',
    href: ROUTES.anticorr,
    icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  },
  {
    title: 'Звіти про діяльність',
    desc: 'Щорічні звіти про діяльність Академії — розділ «Офіційні документи».',
    href: ROUTES.officialDocs,
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
  },
];
