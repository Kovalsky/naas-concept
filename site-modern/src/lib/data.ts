// Typed access to the content data files. Every page renders from
// these — no content is hardcoded in markup.
import personsRaw from '@content/data/persons.json';
import institutesRaw from '@content/data/institutes.json';
import anonsyRaw from '@content/data/anonsy.json';
import resourcesRaw from '@content/data/resources.json';
import contactsRaw from '@content/data/contacts.json';

export interface Person {
  name: string;
  post: string;
  photo: string;
  phone: string;
  bio: string;
  group: 'leadership' | 'members';
  featured: boolean;
}

export interface Institute {
  nazva: string;
  kerivnyk: string;
  web: string;
  email: string;
  tel: string;
  faks: string;
  adresa: string;
}

export interface Division {
  viddilennia: string;
  ustanovy: Institute[];
}

export interface Anons {
  date: string;
  title: string;
  teaser: string;
  image: string;
  url: string;
}

export interface Contacts {
  address: string;
  phone: string;
  phone2: string;
  email: string;
  press_email: string;
  press_phone: string;
  fax: string;
  edrpou: string;
  edrpou_label: string;
}

export const persons: Person[] = personsRaw;
export const divisions: Division[] = institutesRaw;
// Render exactly the real anonsy items (skip any blank entry without a title).
export const anonsy: Anons[] = (anonsyRaw as Anons[]).filter((a) => a.title && a.title.trim());
export const resources: { name: string; url: string }[] = resourcesRaw;
export const contacts: Contacts = contactsRaw;

export const instituteCount = divisions.reduce((n, d) => n + d.ustanovy.length, 0);
export const divisionCount = divisions.length;

// Build initials for an institute monogram (e.g. "Інститут садівництва" → "ІС").
export function initials(name: string): string {
  const words = name.replace(/["“”«».]/g, '').split(/\s+/).filter(Boolean);
  const letters = words
    .filter((w) => /^[А-ЯІЇЄҐA-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]);
  return (letters.join('') || name.slice(0, 2)).toUpperCase();
}
