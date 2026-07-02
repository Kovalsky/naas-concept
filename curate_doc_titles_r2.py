#!/usr/bin/env python3
"""Round 2 of the one-off document-title curation (the 5 registries the first
round did not cover: planuvannya, rizne, naukovi-rozrobky, pasport, koshty).

Titles were derived from the documents themselves: doc/docx via textutil,
PDF via macOS PDFKit text extraction (incl. unambiguous decoding of
Latin-mojibake OCR layers of scanned originals); where a document head was
unreadable, the title is a mechanical normalisation of the file name only.
Every title was drafted and independently re-derived by a second pass
(session 2026-07-02/03). Entries whose sources were weak are conservative.
Mapping is keyed by href. Sort: year desc, no-year last, then title."""
import json

P = "content/data/registries.json"

# href -> (title, year|0)
TITLES = {
    # pubinfo__planuvannya
    "/docs/pubinfo__planuvannya/kalendar-2026.pdf":
        ("Календар знаменних і пам’ятних дат в історії сільськогосподарської дослідної справи України на 2026 рік", 2026),
    "/docs/pubinfo__planuvannya/sait-kal-plan-kviten-2026-kopiia.docx":
        ("Календарний план основних заходів НААН на квітень 2026 року", 2026),
    "/docs/pubinfo__planuvannya/kalendarnyi-plan-naan-na-sichen-2026.doc":
        ("Календарний план основних заходів НААН на січень 2026 року", 2026),
    "/docs/pubinfo__planuvannya/sait-kalend-plan-nu-naan-na-liutyi-2026-kopiia.doc":
        ("Календарний план основних заходів НААН на лютий 2026 року", 2026),
    "/docs/pubinfo__planuvannya/sait-kalendarnyi-plan-berezen-2026.doc":
        ("Календарний план основних заходів НААН на березень 2026 року", 2026),
    "/docs/pubinfo__planuvannya/sait-traven-kal-plan-2026-kopiia.docx":
        ("Календарний план основних заходів НААН на травень 2026 року", 2026),
    "/docs/pubinfo__planuvannya/cherven-kal-plan-2026.docx":
        ("Календарний план основних заходів НААН на червень 2026 року", 2026),
    "/docs/pubinfo__planuvannya/hrafik-pidvyshchennia-kvalifikatsii-u-naukovykh-ustanovakh-naan-na-202.pdf":
        ("Графік підвищення кваліфікації у наукових установах НААН на 2025 рік", 2025),
    "/docs/pubinfo__planuvannya/kalendarnyi-plan-osnovnykh-zakhodiv-natsionalnoi-akademii-ahrarnykh-na.doc":
        ("Календарний план основних заходів НААН на вересень 2025 року", 2025),
    "/docs/pubinfo__planuvannya/na-sait-kal-plan-na-lystopad-2025.doc":
        ("Календарний план основних заходів НААН на листопад 2025 року", 2025),
    "/docs/pubinfo__planuvannya/tvkalendarnyi-plan-zhovten-2025-1.doc":
        ("Календарний план основних заходів НААН на жовтень 2025 року", 2025),
    "/docs/pubinfo__planuvannya/na-sait-kalend-plan-naan-na-veresen-2024-roku.doc":
        ("Календарний план основних заходів НААН на вересень 2024 року", 2024),
    "/docs/pubinfo__planuvannya/na-sait-kalendarnyi-plan-naan-na-lypen-2024.doc":
        ("Календарний план основних заходів НААН на липень 2024 року", 2024),
    "/docs/pubinfo__planuvannya/na-sait-kalendarnyi-plan-naan-na-serpen-2024-roku.doc":
        ("Календарний план основних заходів НААН на серпень 2024 року", 2024),
    "/docs/pubinfo__planuvannya/kal-plan-hrudenn-202sait.doc":
        ("Календарний план основних заходів НААН на грудень 2024 року", 2024),
    "/docs/pubinfo__planuvannya/kal-plan-zhovten-sait.doc":
        ("Календарний план основних заходів НААН на жовтень 2024 року", 2024),
    "/docs/pubinfo__planuvannya/kal-plan-lystopad-sait.doc":
        ("Календарний план основних заходів НААН на листопад 2024 року", 2024),
    "/docs/pubinfo__planuvannya/kal-plan-naan-na-sichen-sait.doc":
        ("Календарний план основних заходів НААН на січень 2025 року", 2025),
    "/docs/pubinfo__planuvannya/lypen-kal-plan-sait.docx":
        ("Календарний план основних заходів НААН на липень 2026 року", 2026),
    "/docs/pubinfo__planuvannya/na-sait-huden.doc":
        ("Календарний план основних заходів НААН на грудень 2025 року", 2025),
    "/docs/pubinfo__planuvannya/naan-propozytsii-tsk-vru.pdf":
        ("Порівняльна таблиця пропозицій НААН до проєкту Закону України про внесення змін до Закону України «Про наукову і науково-технічну діяльність»", 0),
    # pubinfo__rizne
    "/docs/pubinfo__rizne/lyst-ochikuvannia-dpdh-proskurivka-mip.pdf":
        ("Лист очікувань ДПДГ «Проскурівка» МІП", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvannia-dpdh-salyvonkivske-ibkitsb.pdf":
        ("Лист очікувань ДПДГ «Саливонківське» ІБКіЦБ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvannia-dpdh-shevchenkivske-ibkitsb.pdf":
        ("Лист очікувань ДПДГ «Шевченківське» ІБКіЦБ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-elita-du-mdsds-ikosh.pdf":
        ("Лист очікувань ДГ «Еліта» ДУ МДСДС ІКОСГ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-zherebkivske-shi.pdf":
        ("Лист очікувань ДГ «Жеребківське» СГІ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-lvivskoi-ds-instyttutu-rybnoho.pdf":
        ("Лист очікувань ДГ Львівської ДС Інституту рибного господарства", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-nyva-irht.pdf":
        ("Лист очікувань ДГ «Нива» ІРГТ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-nyvka-irh.pdf":
        ("Лист очікувань ДГ «Нивка» ІРГ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-odeske-ikosh.pdf":
        ("Лист очікувань ДГ «Одеське» ІКОСГ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-podilske-tds-ishkr.pdf":
        ("Лист очікувань ДГ «Подільське» ТДС ІСГКР", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-pravdynske-mip.pdf":
        ("Лист очікувань ДГ «Правдинське» МІП", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-prydnistrovskoi-ds-is.pdf":
        ("Лист очікувань ДГ Придністровської ДС ІС", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-pioner-ikosh.pdf":
        ("Лист очікувань ДГ «Піонер» ІКОСГ", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dh-skvyrske-iap.pdf":
        ("Лист очікувань ДГ «Сквирське» ІАП", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dp-nptsv-elita-iarrr.pdf":
        ("Лист очікувань ДП НПЦВ «Еліта» ІАРРР на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-andriivske-ikosh.pdf":
        ("Лист очікувань ДПДГ «Андріївське» ІКОСГ на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-bilokrynytske-ishzr.pdf":
        ("Лист очікувань ДПДГ «Білокриницьке» ІСГЗП на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-vyrishalne-ishps.pdf":
        ("Лист очікувань ДПДГ «Вирішальне» ІСГПС на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-lvivske-is.pdf":
        ("Лист очікувань ДПДГ «Львівське» ІС на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-novator-iok.pdf":
        ("Лист очікувань ДПДГ «Новатор» ІОК на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-radekhivske-ishkr.pdf":
        ("Лист очікувань ДПДГ «Радехівське» ІСГКР", 0),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-stepne-isapv.pdf":
        ("Лист очікувань ДПДГ «Степне» ІСАПВ на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-khrystynivske-irht-im-m-v-zubtsia.pdf":
        ("Лист очікувань ДПДГ «Христинівське» ІРГТ ім. М.В. Зубця на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-dpdh-im-dekabrystiv-ipr.pdf":
        ("Лист очікувань ДПДГ ім. Декабристів ІПР на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-zoria-ishzp.pdf":
        ("Лист очікувань ДПДГ «Зоря» ІСГЗП на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-zoriane.pdf":
        ("Лист очікувань ДПДГ «Зоряне» ІС на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyst-ochikuvan-uladovo-liulynetska-dss-ibktsb.pdf":
        ("Лист очікувань Уладово-Люлинецької ДСС ІБКіЦБ на 2025 рік", 2025),
    "/docs/pubinfo__rizne/lyt-ochikuvan-elitne-ishs.pdf":
        ("Лист очікувань ДПДГ «Елітне» ІСГС на 2025 рік", 2025),
    # pubinfo__naukovi_rozrobky
    "/docs/pubinfo__naukovi_rozrobky/oholoshennia-konkursu-pro-vykonannia-naukovykh-doslidzhen-na-2026-2030.doc":
        ("Оголошення конкурсу на виконання наукових досліджень на замовлення НААН на 2026–2030 роки", 2024),
    "/docs/pubinfo__naukovi_rozrobky/perelik-prohram-i-pidprohram-naukovykh-doslidzhen-naan-na-2026-2030-ro.pdf":
        ("Перелік програм і підпрограм наукових досліджень НААН на 2026–2030 роки", 2026),
    "/docs/pubinfo__naukovi_rozrobky/priorytetni-napriamy-naukovykh-doslidzhen-naan-na-2026-2030-roky.pdf":
        ("Пріоритетні напрями наукових досліджень НААН на 2026–2030 роки", 2026),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-provedennia-zasidan-koordynatsiino-metodychnykh-rad-shchodo-zas.pdf":
        ("Графік проведення засідань КМР щодо заслуховування звітів за І півріччя 2026 року", 0),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-naan-korotki-zvity-2025.pdf":
        ("Графік заслуховування звітів про виконання програм наукових досліджень НААН за 2025 рік", 2025),
    "/docs/pubinfo__naukovi_rozrobky/kmr-i-pivrichchia-2025.pdf":
        ("Графік проведення засідань КМР щодо заслуховування звітів за І півріччя 2025 року", 2025),
    "/docs/pubinfo__naukovi_rozrobky/oholoshennia-shchodo-konkursu-pro-vykonannia-korotkoterminovykh-prykla.d":
        ("Оголошення конкурсу на виконання короткотермінових прикладних наукових досліджень на 2025 рік", 2025),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-provedennia-zasidan-kmr-shchodo-zaslukhovuvannia-zvitiv-za-i-pi.pdf":
        ("Графік проведення засідань КМР щодо заслуховування звітів за І півріччя 2024 року", 0),
    "/docs/pubinfo__naukovi_rozrobky/konkurs-pro-vykonannia-pnd-na-2024-2025-roky-ta-korotkoterminovykh-pnd.pdf":
        ("Конкурс на виконання ПНД на 2024–2025 роки та короткотермінових ПНД на 2024 рік на замовлення НААН", 2024),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-zaslukhovuvannia-zvitiv-kmr-za-i-pivr-2023-r.pdf":
        ("Графік заслуховування звітів КМР за І півріччя 2023 року", 2023),
    "/docs/pubinfo__naukovi_rozrobky/oholoshennia-konkursu-na-vykonannia-korotkoterminovykh-prykladnykh-dos.doc":
        ("Оголошення конкурсу на виконання короткотермінових прикладних наукових досліджень у 2023 році", 2023),
    "/docs/pubinfo__naukovi_rozrobky/pro-komisii-z-pryimannia-zavershenykh-u-2023-rotsi-naukovo-doslidnykh-.pdf":
        ("Про комісії з приймання завершених у 2023 році науково-дослідних та дослідно-конструкторських робіт", 2023),
    "/docs/pubinfo__naukovi_rozrobky/1-hrafik-naan-korotki-zvity-za-2022-rik.pdf":
        ("Графік заслуховування звітів про виконання програм наукових досліджень НААН за 2022 рік", 2022),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-zaslukhovuvannia-zvitiv-kmr-za-i-pivr-2022.pdf":
        ("Графік заслуховування звітів КМР за І півріччя 2022 року", 2022),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-zaslukhovuvannia-zvitiv-kmr-za-2021-rik.pdf":
        ("Графік заслуховування звітів КМР за 2021 рік", 2021),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-zaslukhovuvannia-zvitiv-pro-vykonannia-pnd-naan-za-2021-r.pdf":
        ("Графік заслуховування звітів про виконання ПНД НААН за 2021 рік", 2021),
    "http://naas.gov.ua/upload/iblock/8ad/Katalog-2020_ToPress(1)_p121-153.pdf":
        ("Каталог інноваційних розробок НААН 2020 (с. 121–153)", 2020),
    "/docs/pubinfo__naukovi_rozrobky/katalog-2020-topress-1-p154-201.pdf":
        ("Каталог інноваційних розробок НААН 2020, розділ III «Тваринництво» (с. 154–201)", 2020),
    "/docs/pubinfo__naukovi_rozrobky/katalog-2020-topress-1-p202-216.pdf":
        ("Каталог інноваційних розробок НААН 2020, розділ IV «Ветеринарна медицина» (с. 202–216)", 2020),
    "/docs/pubinfo__naukovi_rozrobky/katalog-2020-topress-1-p217-233.pdf":
        ("Каталог інноваційних розробок НААН 2020, розділ V «Аграрна економіка і продовольство» (с. 217–233)", 2020),
    "http://naas.gov.ua/upload/iblock/4bf/Katalog-2020_ToPress(1)_p234-266.pdf":
        ("Каталог інноваційних розробок НААН 2020 (с. 234–266)", 2020),
    "/docs/pubinfo__naukovi_rozrobky/hrafik-naan-korotki-zvity-za-2020-r.pdf":
        ("Графік заслуховування звітів про виконання програм наукових досліджень НААН за 2020 рік", 2020),
    "/docs/pubinfo__naukovi_rozrobky/vitchyzniane-silske-hospodarstvo-v-suchasnykh-umovakh-vyklyky-ta-shlia.pdf":
        ("Ярослав Гадзало. Вітчизняне сільське господарство в сучасних умовах: виклики та шляхи їх подолання", 2023),
    # pubinfo__pasport_budget
    "/docs/pubinfo__pasport_budget/zvit-pro-vykonannia-pasportu-bp-6591020-na-1-sichnia-2017r.pdf":
        ("Звіт про виконання паспорта бюджетної програми станом на 1 січня 2017 року за КПКВК 6591020", 2017),
    "/docs/pubinfo__pasport_budget/zvit-pro-vykonannia-pasportu-bp-6591060-na-1-sichnia-2017r-1.pdf":
        ("Звіт про виконання паспорта бюджетної програми станом на 1 січня 2017 року за КПКВК 6591060", 2017),
    "/docs/pubinfo__pasport_budget/zvit-pro-vykonannia-pasportu-bp-6591080-na-1-sichnia-2017r.pdf":
        ("Звіт про виконання паспорта бюджетної програми станом на 1 січня 2017 року за КПКВК 6591080", 2017),
    "/docs/pubinfo__pasport_budget/zvit-pro-vykonannia-pasportu-bp-6591100-na-1-sichnia-2017r.pdf":
        ("Звіт про виконання паспорта бюджетної програми станом на 1 січня 2017 року за КПКВК 6591100", 2017),
    "/docs/pubinfo__pasport_budget/pasport-bp-6591020-na-2017-r.pdf":
        ("Паспорт бюджетної програми на 2017 рік КПКВК 6591020", 2017),
    "/docs/pubinfo__pasport_budget/pasport-bp-6591060-na-2017-r.pdf":
        ("Паспорт бюджетної програми на 2017 рік КПКВК 6591060", 2017),
    "/docs/pubinfo__pasport_budget/pasport-bp-6591080-na-2017-r.pdf":
        ("Паспорт бюджетної програми на 2017 рік КПКВК 6591080", 2017),
    "/docs/pubinfo__pasport_budget/pasport-bp-6591100-na-2017-r.pdf":
        ("Паспорт бюджетної програми на 2017 рік КПКВК 6591100", 2017),
    "/docs/pubinfo__pasport_budget/pasport-biudzhetno-prohramy-na-2016-r-k-kpkvk-6591080.pdf":
        ("Паспорт бюджетної програми на 2016 рік КПКВК 6591080", 2016),
    "/docs/pubinfo__pasport_budget/pasport-bp-1020-19-11-2015.pdf":
        ("Паспорт бюджетної програми 1020 від 19.11.2015", 2015),
    "/docs/pubinfo__pasport_budget/pasport-bp-1100-23-10-2015.pdf":
        ("Паспорт бюджетної програми 1100 від 23.10.2015", 2015),
    "/docs/pubinfo__pasport_budget/1020-1.pdf":
        ("Документ до паспорта бюджетної програми 1020", 0),
    "/docs/pubinfo__pasport_budget/6591020.pdf":
        ("Про внесення змін до паспорта бюджетної програми на 2016 рік за КПКВК 6591020", 2016),
    "/docs/pubinfo__pasport_budget/6591060.pdf":
        ("Документ до паспорта бюджетної програми КПКВК 6591060", 0),
    "/docs/pubinfo__pasport_budget/6591100.pdf":
        ("Про внесення змін до паспорта бюджетної програми на 2016 рік за КПКВК 6591100", 2016),
    "/docs/pubinfo__pasport_budget/file.pdf":
        ("Про внесення змін до паспорта бюджетної програми на 2016 рік", 2016),
    "/docs/pubinfo__pasport_budget/pasport-6591060.pdf":
        ("Паспорт бюджетної програми КПКВК 6591060", 0),
    "/docs/pubinfo__pasport_budget/pasport-bp-1060-11.pdf":
        ("Паспорт бюджетної програми 1060", 0),
    "/docs/pubinfo__pasport_budget/pasport-bp-1080-11.pdf":
        ("Паспорт бюджетної програми 1080", 0),
    "/docs/pubinfo__pasport_budget/pasport-bp-6591020.pdf":
        ("Паспорт бюджетної програми КПКВК 6591020", 0),
    "/docs/pubinfo__pasport_budget/pasport-bp-6591080.pdf":
        ("Паспорт бюджетної програми КПКВК 6591080", 0),
    "/docs/pubinfo__pasport_budget/pasport-bp-6591100.pdf":
        ("Паспорт бюджетної програми КПКВК 6591100", 0),
    # pubinfo__vikoristannya_koshtiv
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-2025-aparat-prezydii.pdf":
        ("Звіт апарату Президії НААН за 2025 рік", 2025),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-za-i-kvartal-2025-roku.pdf":
        ("Звіт за І квартал 2025 року", 2025),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-za-1-kvartal-2023-roku.pdf":
        ("Звіт за І квартал 2023 року", 2023),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-za-1-pivrichchia-2023-roku.pdf":
        ("Звіт за І півріччя 2023 року", 2023),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-za-1-kvartal-2022-roku.pdf":
        ("Звіт за І квартал 2022 року", 2022),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-za-1-pivrichchia-2022-roku.pdf":
        ("Звіт за І півріччя 2022 року", 2022),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-naan-z-ohliadu-vytrat-za-2020-2022-rr-z-pidpysamy-1.pdf":
        ("Звіт про огляд витрат державного бюджету у сфері наукової і науково-технічної діяльності наукових установ НААН за 2020–2022 роки", 2023),
    "/docs/pubinfo__vikoristannya_koshtiv/dopovid-hladiia-m-v-na-zborakh-pidsumky-za-2021r.docx":
        ("Доповідь М. В. Гладія про фінансове забезпечення та використання коштів НААН у 2021 році", 2021),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-za-1-pivrichchia-2021-r.pdf":
        ("Звіт за І півріччя 2021 року", 2021),
    "/docs/pubinfo__vikoristannya_koshtiv/informatsiia-zvit-2020r.docx":
        ("Інформація НААН про виконання Державного бюджету України за 2020 рік", 2020),
    "/docs/pubinfo__vikoristannya_koshtiv/form-2dc-merged.pdf":
        ("Зведений звіт про фінансові результати (форма № 2-дс) станом на 01.10.2024", 2024),
    "/docs/pubinfo__vikoristannya_koshtiv/form-2dc-merged-1.pdf":
        ("Зведений звіт про фінансові результати (форма № 2-дс) станом на 01.10.2024", 2024),
    "/docs/pubinfo__vikoristannya_koshtiv/form-2dc-merged-merged.pdf":
        ("Зведений звіт про фінансові результати (форма № 2-дс) станом на 01.04.2024", 2024),
    "/docs/pubinfo__vikoristannya_koshtiv/zvit-naan-ta-poiasniuvalna-zapyska.docx":
        ("Звіт про результати діяльності підрозділу внутрішнього аудиту НААН за 2022 рік", 2022),
    "/docs/pubinfo__vikoristannya_koshtiv/ytoh2.pdf":
        ("Зведений фінансовий звіт НААН", 0),
    "/docs/pubinfo__vikoristannya_koshtiv/oper-plan.pdf":
        ("Оперативний план", 0),
}

data = json.load(open(P, encoding="utf-8"))
updated = 0
for reg in data:
    touched = False
    for it in reg["items"]:
        if it["href"] in TITLES:
            title, year = TITLES[it["href"]]
            it["title"] = title
            if year:
                it["year"] = year
            updated += 1
            touched = True
    if touched:
        reg["items"].sort(key=lambda x: (x["year"] == 0, -(x["year"] or 0), x["title"].lower()))
json.dump(data, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("updated titles:", updated)
