export type HeroVariant = 'v1' | 'v3';
export const HERO: HeroVariant = (import.meta.env.HERO === 'v3' ? 'v3' : 'v1');
export const HERO_H1 = 'Національна академія аграрних наук України';
export const HERO_SLOGAN = 'Науково-методичний і координаційний центр з наукових проблем розвитку АПК України';
