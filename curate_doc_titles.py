#!/usr/bin/env python3
"""One-off curation of document titles in content/data/registries.json.

Titles come from the headings of the FILES THEMSELVES (textutil extraction,
session 2026-07-02); PDF titles are a mechanical normalisation of the
transliterated file names (PDF text is not extractable locally — nothing is
invented). Mapping is keyed by href — a stable key. Registry sort order:
year desc, entries without a year (0) last, then by title."""
import json

P = "content/data/registries.json"

TITLES = {
    # /prozorist/tendery (from the document text: r-chnyi-plan.doc = «ПРОЕКТ
    # РІЧНИЙ ПЛАН ЗАКУПІВЕЛЬ на 2015 рік … НААН … 00024360»;
    # plan-zakupiv-2015.docx = ЗАТ «Інститут інноваційного провайдингу УААН»)
    "/docs/pubinfo__tendery/r-chnyi-plan.doc":
        ("Річний план закупівель НААН на 2015 рік (проєкт)", 2015),
    "/docs/pubinfo__tendery/plan-zakupiv-2015.docx":
        ("Річний план закупівель — ЗАТ «Інститут інноваційного провайдингу УААН», 2015", 2015),
    "/docs/pubinfo__tendery/zminy-2-do-dodatku-do-rp-2015.pdf":
        ("Зміни № 2 до додатка до річного плану закупівель 2015 року", 2015),
    # richnyi-plan-zakupivel-2015-rik.pdf and richnyi-plan-zakupivel-na-2015-rik.pdf
    # are DIFFERENT files (631 KB / 525 KB) with human-readable titles already;
    # RegistryList now shows the size, which tells them apart.
    # richnyi-plan-zakupivel.pdf — year unknown, left as is.

    # /atestatsiia (all titles from the first lines of the documents, textutil 2026-07-02)
    "/docs/atestatsiya/oholoshennia-na-sait-2025.docx":
        ("Обсяги прийому аспірантів та докторантів за державним замовленням, 2025", 2025),
    "/docs/atestatsiya/oholoshennia-na-sait-2024.docx":
        ("Обсяги прийому аспірантів та докторантів за державним замовленням, 2024", 2024),
    "/docs/atestatsiya/oholoshennia-konkurs-2017.docx":
        ("Конкурс виконавців державного замовлення на підготовку наукових кадрів (аспірантура/докторантура), 2017", 2017),
    "/docs/atestatsiya/nakaz-mon-758-vid-14-07-2015-r.docx":
        ("Наказ МОН від 14.07.2015 № 758 «Про оприлюднення дисертацій та відгуків офіційних опонентів»", 2015),
    "/docs/atestatsiya/oholoshennia-na-sait-rezultaty-konkursu-20-08-2015.docx":
        ("Результати конкурсу з розподілу держзамовлення на підготовку наукових кадрів, 2015", 2015),
    "/docs/atestatsiya/doktorantura.doc":
        ("Підготовка наукових кадрів через докторантуру в наукових установах НААН", 0),
    "/docs/atestatsiya/perelik-ustanov-v-iakykh-zdiisniuietsia-pidhotovka-aspirantiv.docx":
        ("Перелік установ НААН, яким видано ліцензію на підготовку аспірантів", 0),
    "/docs/atestatsiya/spysok-spetsializovanykh-rad.docx":
        ("Спеціалізовані вчені ради з присудження ступеня доктора наук (станом на 01.03.2024)", 2024),

    # /intelektualna-vlasnist/normativna-baza (from the first lines of the documents)
    "/docs/ip__normativno_pravova_dok/dlia-informatsiino-patentnoho-poshuku.doc":
        ("Перелік науково-технічних баз даних і довідкових ресурсів з безоплатним доступом (ДП «УІПВ», 2015)", 2015),
    "/docs/ip__normativno_pravova_dok/httpsips-gov-uauainfo-resurses-html.doc":
        ("Перелік зарубіжних баз даних об'єктів промислової власності з безоплатним доступом (2015)", 2015),

    # /publichna-informatsiia/budjetni-zapity (file-name normalisation: form/КПКВК/year)
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-1-zahalna-utochnennia-2026-01-01-2026.pdf":
        ("Бюджетний запит — форма БЗ-1 (загальна), уточнення 2026", 2026),
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-2-indyvidualna-utochnennia-2026-6591020-01-.pdf":
        ("Бюджетний запит — форма БЗ-2 (індивідуальна), КПКВК 6591020, уточнення 2026", 2026),
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-2-indyvidualna-utochnennia-2026-6591060-01-.pdf":
        ("Бюджетний запит — форма БЗ-2 (індивідуальна), КПКВК 6591060, уточнення 2026", 2026),
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-2-indyvidualna-utochnennia-2026-6591100-01-.pdf":
        ("Бюджетний запит — форма БЗ-2 (індивідуальна), КПКВК 6591100, уточнення 2026", 2026),
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-1-zahalna-utochnennia-2025-01-01-2025.pdf":
        ("Бюджетний запит — форма БЗ-1 (загальна), уточнення 2025", 2025),
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-2-indyvidualna-utochnennia-2025-6591020-01-.pdf":
        ("Бюджетний запит — форма БЗ-2 (індивідуальна), КПКВК 6591020, уточнення 2025", 2025),
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-2-indyvidualna-utochnennia-2025-6591060-01-.pdf":
        ("Бюджетний запит — форма БЗ-2 (індивідуальна), КПКВК 6591060, уточнення 2025", 2025),
    "/docs/pubinfo__budjetni_zapity/biudzhetnyi-zapyt-forma-bz-2-indyvidualna-utochnennia-2025-6591100-01-.pdf":
        ("Бюджетний запит — форма БЗ-2 (індивідуальна), КПКВК 6591100, уточнення 2025", 2025),
    "/docs/pubinfo__budjetni_zapity/bz-2024-f1.pdf":
        ("Бюджетний запит — форма БЗ-1, 2024", 2024),
    "/docs/pubinfo__budjetni_zapity/bz-2024-f2.pdf":
        ("Бюджетний запит — форма БЗ-2, 2024", 2024),
}

data = json.load(open(P, encoding="utf-8"))
updated = 0
for reg in data:
    for it in reg["items"]:
        if it["href"] in TITLES:
            title, year = TITLES[it["href"]]
            it["title"] = title
            if year:
                it["year"] = year
            updated += 1
    # registry order: year desc, no-year (0) last, then by title
    reg["items"].sort(key=lambda x: (x["year"] == 0, -(x["year"] or 0), x["title"].lower()))
json.dump(data, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("updated titles:", updated)
