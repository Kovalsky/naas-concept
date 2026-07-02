#!/usr/bin/env node
// Design-audit regression checks (plan 2026-07-02-site-modern-design-audit).
// Run AFTER `npm run build` — asserts against the built dist/.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');

const distFile = (p) => resolve(DIST, p);
const read = (p) => readFileSync(distFile(p), 'utf8');
const readCss = () =>
  readdirSync(resolve(DIST, '_astro'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(resolve(DIST, '_astro', f), 'utf8'))
    .join('\n');

let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log('  ok  ' + name); }
  catch (e) { failed++; console.error('FAIL  ' + name + ' — ' + e.message); }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

check('dist/ існує (спершу npm run build)', () => assert(existsSync(DIST), 'dist/ відсутній'));
check('T1: мобільний дровер має скрім (регресія п.17)', () => {
  assert(read('index.html').includes('id="mnav-scrim"'), 'скрім дровера зник з розмітки');
});

// ==== TASK CHECKS ====
check('T2: hero webp-варіанти згенеровано', () => {
  for (const f of ['img/news/art8965.960.webp', 'img/news/art8965.1600.webp'])
    assert(existsSync(distFile(f)), 'відсутній ' + f);
});
check('T2: розміри webp у бюджеті', () => {
  const cap = (f, kb) => {
    assert(existsSync(distFile(f)), 'відсутній ' + f);
    const sz = statSync(distFile(f)).size;
    assert(sz <= kb * 1024, `${f} = ${Math.round(sz / 1024)}KB > ${kb}KB`);
  };
  cap('img/news/art8965.1600.webp', 360);
  cap('img/news/art8965.960.webp', 250);
  cap('img/anonsy/seminar-etyka.160.webp', 30);
});
check('T3: головна на webp, сирих jpg/png немає', () => {
  const html = read('index.html');
  assert(html.includes('art8965.960.webp') && html.includes('art8965.1600.webp'), 'hero srcset відсутній');
  const raw = [...html.matchAll(/<img[^>]+src="(\/img\/[^"]+\.(?:jpe?g|png))"/gi)].map((m) => m[1]);
  assert(raw.length === 0, 'сирі растри в index.html: ' + raw.join(', '));
});
check('T3: усі referenced webp існують і в бюджеті (крім 1600w)', () => {
  const html = read('index.html');
  const srcs = [...html.matchAll(/"(\/img\/[^"]+\.webp)"/g)].map((m) => m[1]);
  const srcset = [...html.matchAll(/srcset="([^"]+)"/g)]
    .flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]))
    .filter((s) => s.startsWith('/img/'));
  for (const f of new Set([...srcs, ...srcset])) {
    const p = distFile(f.slice(1));
    assert(existsSync(p), `відсутній ${f}`);
    if (!f.includes('.1600.')) assert(statSync(p).size <= 250 * 1024, `${f} > 250KB`);
  }
});
check('T4: стрічка головної має ≥4 новини списком + анонси', () => {
  const html = read('index.html');
  const rows = (html.match(/hm-newsrow/g) || []).length;
  assert(rows >= 4, `hm-newsrow: ${rows} < 4`);
  assert(html.includes('hm-anon '), 'блок анонсів зник');
});
check('T5: картка каталогу розробок на головній', () => {
  const html = read('index.html');
  assert(html.includes('drive.google.com/file/d/19noLIfpdJlW0mjxNkY21SQjxhWDYlp1A'), 'лінк каталогу відсутній');
  const cards = (html.match(/hm-rescard /g) || []).length;
  assert(cards === 4, `hm-rescard: ${cards} !== 4`);
});
check('T6: список новин — webp-картки', () => {
  const html = read('novyny/index.html');
  assert(html.includes('.480.webp'), 'карток на webp нема');
  assert(!/<img[^>]+src="\/img\/[^"]+\.(jpe?g|png)"/i.test(html), 'сирі растри у списку новин');
});
check('T6: новини — фільтр-чипи за категоріями', () => {
  const html = read('novyny/index.html');
  const chips = (html.match(/class="chip[ "]/g) || []).length;
  assert(chips >= 9, `чипів ${chips} < 9 (Всі + 8 категорій)`);
  assert(html.includes('data-tag="Президія"'), 'на картках нема data-tag');
});
check('T7: новина — webp, брейдкрамб = заголовок статті', () => {
  const html = read('novyny/naan-kormovyrobnytstvo-yes/index.html');
  assert(html.includes('.960.webp'), 'зображення статті не webp');
  assert(/<span class="cur"[^>]*>[^<]*кормовиробництво/.test(html), 'у .cur досі категорія, а не заголовок');
});
check('T7: новина — related-блок і share', () => {
  const html = read('novyny/naan-kormovyrobnytstvo-yes/index.html');
  assert(html.includes('Читайте також'), 'нема блоку «Читайте також»');
  assert(html.includes('data-share="tg"'), 'нема share-лінків');
  assert(html.includes('id="share-copy"'), 'нема кнопки копіювання лінка');
});
check('T8: анонси — події з дата-плиткою, «минув», окрема стрічка видань', () => {
  const html = read('anonsy/index.html');
  assert((html.match(/class="ev(\s|")/g) || []).length >= 2, 'карток подій < 2');
  assert(html.includes('Видання та матеріали'), 'нема стрічки «Видання та матеріали»');
  assert(html.includes('минув'), 'бейджа «минув» нема (семінар 30 червня 2026 — у минулому)');
  assert(html.includes('.480.webp'), 'обкладинки видань не webp');
});
check('T9: атестація має 4 блоки ТЗ', () => {
  const html = read('atestatsiia/index.html');
  for (const t of ['Аспірантура та докторантура', 'Спеціалізовані вчені ради', 'Наукові видання НААН', 'Державна атестація наукових установ'])
    assert(html.includes(t), 'відсутній блок: ' + t);
  assert(html.includes('/vydavnycha-diyalnist'), 'нема лінка на видання');
});
check('T10: зламані/сирі назви документів виправлено', () => {
  const tendery = read('prozorist/tendery/index.html');
  assert(!tendery.includes('Р чний'), '«Р чний» досі у тендерах');
  assert(tendery.includes('проєкт'), 'нової назви 2015-проєкту нема');
  const bz = read('publichna-informatsiia/budjetni-zapity/index.html');
  assert(!bz.includes('БЮДЖЕТНИЙ ЗАПИТ'), 'CAPS-назви лишилися');
  assert(bz.includes('КПКВК 6591020'), 'нормалізованих назв БЗ нема');
  const at = read('atestatsiia/index.html');
  assert(at.includes('Про оприлюднення дисертацій'), 'наказ МОН 758 без предмета наказу');
});
check('T10: RegistryList показує розмір і правильну плюралізацію', () => {
  const html = read('publichna-informatsiia/planuvannya/index.html');
  assert(html.includes('21 документ<'), 'плюралізація досі зламана (очікується «21 документ»)');
  assert(/\d+\s*КБ|\d+,\d+\s*МБ/.test(read('prozorist/tendery/index.html')), 'розмір файлу не показується');
});
check('T11: у відео-назвах нема російських літер', () => {
  for (const page of ['video/index.html', 'agrolectures/index.html'])
    assert(!/[ыэъё]/i.test(read(page)), 'російська в ' + page);
});
check('T12: контакти — мапа і місток до установ', () => {
  const html = read('kontakty/index.html');
  assert(html.includes('<iframe title="Мапа'), 'iframe мапи відсутній');
  assert(html.includes('href="/struktura"'), 'нема лінка на структуру');
});
check('T12: контакти — форма без Turnstile-бутафорії', () => {
  const html = read('kontakty/index.html');
  assert(!html.includes('challenges.cloudflare.com'), 'turnstile-скрипт лишився');
  assert(!html.includes('cf-turnstile'), 'turnstile-віджет лишився');
  assert(html.includes('поштовій програмі'), 'чесного пояснення про mailto нема');
});
check('T13: структура — якірні чипи відділень', () => {
  const html = read('struktura/index.html');
  assert(html.includes('id="viddilennia-6"'), 'нема id на 6-му відділенні');
  const links = (html.match(/href="#viddilennia-/g) || []).length;
  assert(links === 6, `якірних лінків: ${links} !== 6`);
});
check('T13: структура — кольорове кодування відділень', () => {
  const html = read('struktura/index.html');
  const n = (html.match(/--div-c:/g) || []).length;
  assert(n === 6, `--div-c блоків: ${n} !== 6`);
});
check('T14: рада молодих — без повторюваних префіксів у картках установ', () => {
  const html = read('rada-molodykh/index.html');
  // The central council keeps its full name («…Національної академії аграрних
  // наук України»), so the institution-prefix pattern must not match it.
  assert(!/Рада молодих вчених (ДУ|Інститут|Національної наукової|Селекційно)/.test(html), 'префікс у картках лишився');
  assert(html.includes('Інститут зернових культур'), 'назви установ зникли');
});
check('T15: row-desc блоковий (нема злипання «Тендериу…»)', () => {
  assert(/\.row-desc\{[^}]*display:block/.test(readCss().replace(/\s+/g, '')), '.row-desc без display:block');
});
check('T15: внутрішній жаргон «(перенесено за ТЗ)» прибрано', () => {
  const html = read('publichna-informatsiia/index.html');
  assert(!html.includes('перенесено за ТЗ'), '«перенесено за ТЗ» досі на сторінці');
  assert(html.includes('див. розділ'), 'нового формулювання нема');
});
check('T16: прозорість — 6 карток, зі звітами', () => {
  const html = read('prozorist/index.html');
  assert(html.includes('Звіти про діяльність'), 'картки звітів нема');
  assert(html.includes('href="/ofitsiyni-dokumenty"'), 'лінк на офіційні документи відсутній');
});
check('T17: AGROLECTURES перейменовано на Агролекторій', () => {
  assert(!read('index.html').includes('AGROLECTURES'), 'AGROLECTURES на головній');
  const ag = read('agrolectures/index.html');
  assert(ag.includes('Агролекторій'), 'нового заголовка нема');
});
check('T18: 404 — швидкі посилання', () => {
  const html = read('404.html');
  for (const href of ['/novyny', '/struktura', '/kontakty'])
    assert(html.includes(`href="${href}"`), '404 без лінка ' + href);
});
check('T19: панель доступності замість grayscale-фільтра', () => {
  const css = readCss();
  assert(!css.includes('saturate(0)'), 'grayscale-фільтр досі в CSS');
  assert(css.replace(/\s+/g, '').includes('zoom:1.125'), 'нема правила масштабу шрифту');
  const html = read('index.html');
  assert(html.includes('id="a11y-panel"'), 'панелі доступності нема в розмітці');
  assert(html.includes('id="hc-toggle"'), 'перемикач контрасту зник');
});
check('T20: каркаси доступу та антикорупції структуровані', () => {
  const d = read('prozorist/dostup/index.html');
  assert(d.includes('Форми запитів на інформацію'), 'dostup: нема блоку форм запитів');
  assert(d.includes('Контакти розпорядника інформації'), 'dostup: нема блоку контактів');
  const z = read('prozorist/zapobihannia-koruptsii/index.html');
  assert(z.includes('Уповноважена особа'), 'антикорупція: нема блоку уповноваженої особи');
  assert(z.includes('викривачів'), 'антикорупція: нема каналів викривачів');
  assert(z.includes('матеріал готується') && d.includes('матеріал готується'), 'статус «готується» зник');
});
check('T21: статут — рік редакції; «Повний текст» не обіцяє тексту', () => {
  const s = read('statut/index.html');
  assert(s.includes('2021 рік'), 'року редакції нема на /statut');
  const n = read('naan-sohodni/index.html');
  assert(!n.includes('Повний текст'), '«Повний текст» досі на naan-sohodni');
});
check('T22: віртуальна виставка — архівна позначка + актуальний каталог', () => {
  const html = read('intelektualna-vlasnist/vystavka/index.html');
  assert(html.includes('архівні (2014'), 'нема позначки архівності');
  assert(html.includes('drive.google.com'), 'нема лінка на актуальний каталог розробок');
});
check('T24: тендери — Prozorro-CTA на самій сторінці', () => {
  const html = read('prozorist/tendery/index.html');
  assert(html.includes('href="https://prozorro.gov.ua/"'), 'нема кнопки-лінка Prozorro');
});
check('T25: НААН сьогодні — таймлайн віх історії', () => {
  const html = read('naan-sohodni/index.html');
  assert(html.includes('milestones'), 'нема блоку milestones');
  for (const y of ['>1918<', '>1931<', '>1990<', '>2010<'])
    assert(html.includes(y), 'нема віхи ' + y);
});
check('T23: хаб публічної інформації — лічильники документів', () => {
  const html = read('publichna-informatsiia/index.html');
  for (const c of ['28 документів', '10 документів', '21 документ<'])
    assert(html.includes(c), 'нема лічильника: ' + c);
});
// ==== END TASK CHECKS ====

console.log(failed ? `\n${failed} checks FAILED` : '\nall checks passed');
process.exit(failed ? 1 : 0);
