import personsRaw from '@shared/data/persons.json';
import institutesRaw from '@shared/data/institutes.json';
import anonsyRaw from '@shared/data/anonsy.json';
import contactsRaw from '@shared/data/contacts.json';

export interface Institute { nazva: string; kerivnyk: string; web: string; email: string; tel: string; faks: string; adresa: string; }
export interface Division { viddilennia: string; ustanovy: Institute[]; }
export interface Person { name: string; post: string; photo: string; phone: string; bio: string; group: 'leadership' | 'members'; featured: boolean; }
export interface Anons { date: string; title: string; teaser: string; image: string; url: string; }
export interface Contacts { address: string; phone: string; email: string; press_email: string; press_phone: string; edrpou: string; edrpou_label: string; }

export const persons: Person[] = personsRaw as Person[];
export const divisions: Division[] = institutesRaw as Division[];
export const anonsy: Anons[] = (anonsyRaw as Anons[]).filter((a) => a.title && a.title.trim());
export const contacts: Contacts = contactsRaw as Contacts;
export const divisionCount = divisions.length;
export const instituteCount = divisions.reduce((n, d) => n + d.ustanovy.length, 0);
