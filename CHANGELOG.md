# Changelog

## 2026-11-19
- Проект создан: исследование спроса (research/plants_kw.mjs), черновой план страниц research/content_plan.csv (275 страниц + 719 строк), задание CLAUDE.md. Ничего не опубликовано.
- 2026-11-19 · CLAUDE.md: добавлен раздел «Доступы» (Keyword Planner через Google Ads API, Search Console CLI, GA4).
- Бренд: **Hojapedia**, домен hojapedia.com (RDAP Verisign 2026-11-19: свободен; поиск: конкурентов с таким именем нет, близкое — Hoyapedia, вики Georgetown). Домен НЕ куплен — ждёт явного «да».
- Скелет Astro 7 (как в pets-es, без бренда/контента оттуда): content collection `plants` (один JSON на растение в src/data/plants/, схема требует свет/полив/температуру/влажность/грунт/удобрение, токсичность с URL ASPCA и датой проверки, размножение, ≥3 проблемы, источники; minC = null, если источник не дал минимум — не выдумывать). Шаблон карточки /plantas/[slug]/: быстрая таблица, полив по полушариям (src/lib/seasons.js), токсичность, размножение (HowTo), проблемы, FAQ (FAQPage), Article, BreadcrumbList. Без клиентского JS. Тесты: npm test (7).
- 3 пробные карточки: orquidea (RHS, AOS), sansevieria (RHS, Clemson, UGA, NParks), potus (Clemson). ASPCA проверено 2026-11-19: Phalaenopsis — не токсична; Snake Plant и Golden Pothos — токсичны для кошек и собак.
- Открыто: родина потуса — Clemson пишет «Китай, Индия, ЮВА», по другим данным — Полинезия (Муреа); в карточке пока нейтрально «Asia y el Pacífico», нужен второй источник (POWO/Kew).
- Деплой как в pets-es (решение пользователя): Cloudflare Workers + static assets, сборка из GitHub (Workers Builds), репозиторий alexanderklimin/hojapedia (приватный), deploy key /root/.ssh/hojapedia_deploy, алиас github-hojapedia. Превью на *.workers.dev.
- public/_headers: ВРЕМЕННО X-Robots-Tag noindex до запуска — удалить при публикации на hojapedia.com, тогда же workers_dev=false и routes в wrangler.jsonc.
