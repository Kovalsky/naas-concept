import data from '../data/registries.json';

export interface RegItem {
  title: string;
  ext: string;
  href: string;
  year: number;
  sizeKB: number;
  external?: boolean;
}
export interface Registry {
  key: string;
  title: string;
  route: string;
  source_url: string;
  count: number;
  items: RegItem[];
}

export const registries: Registry[] = data as Registry[];
export const byRoute = (route: string): Registry | undefined =>
  registries.find((r) => r.route === route);

// Short, restrained leads (institutional tone) per registry route.
export const LEADS: Record<string, string> = {
  '/publichna-informatsiia/normativno-pravova-baza':
    'Нормативно-правові акти та внутрішні документи, що регулюють діяльність Академії.',
  '/publichna-informatsiia/naukovi-rozrobky':
    'Графіки заслуховування звітів, переліки програм наукових досліджень і оголошення конкурсів.',
  '/publichna-informatsiia/planuvannya':
    'Календарні плани основних заходів Академії та супутні документи планування.',
  '/publichna-informatsiia/rizne':
    'Інші офіційні матеріали, зокрема листи очікувань дослідних господарств.',
  '/publichna-informatsiia/budjetni-zapity':
    'Бюджетні запити за формами БЗ-1 та БЗ-2 за відповідні роки.',
  '/publichna-informatsiia/pasport-byudzhetnoyi-programy':
    'Паспорти бюджетних програм та звіти про їх виконання за кодами програмної класифікації.',
  '/publichna-informatsiia/vykorystannya-koshtiv':
    'Фінансові звіти та звіти про використання коштів державного бюджету.',
  '/prozorist/tendery':
    'Річні плани публічних закупівель Академії. Поточні закупівлі — у системі Prozorro.',
  '/atestatsiia':
    'Офіційні документи з підготовки та атестації наукових кадрів: спеціалізовані ради, ліцензії, конкурси.',
  '/intelektualna-vlasnist/normativna-baza':
    'Нормативно-правова документація з питань інтелектуальної власності.',
  '/intelektualna-vlasnist/vystavka':
    'Матеріали віртуальної виставки інноваційних розробок.',
};
