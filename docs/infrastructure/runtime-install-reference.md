# Встановлення рантаймів на сервері (Debian 12 bookworm) — довідник

**Що це:** перевірені переліки системних пакетів для встановлення рантаймів на нашому сервері (Debian 12). Ставить **Mirohost support** (root у нас нема). Назви пакетів звірені саме для bookworm.

**Пов'язане:** [`mirohost-server.md`](mirohost-server.md), [`../architecture/portal-architecture.md`](../architecture/portal-architecture.md).

**Що вже є, ставити не треба:** Node.js v20 + npm, Python 3.11 + pip + venv, git. Тобто **фаза 1 (Next.js + Directus) не потребує жодних встановлень.** Цей довідник — для рантаймів, яких нема (Elixir для фази 2; Ruby — як відхилена альтернатива, лишено для повноти).

---

## Elixir / Phoenix (фаза 2 — цільовий бекенд)

Актуальний **Phoenix v1.8.8** потребує **Elixir 1.15+** і **Erlang/OTP 24+**. Node для Phoenix не потрібен (вбудований esbuild). Сам Phoenix ставимо ми через `mix archive.install hex phx_new`. Драйвери БД (`myxql`) — чистий Elixir, системних бібліотек не треба. [verified: phoenix.hexdocs.pm/installation]

**Важливо:** Debian-пакет `elixir` у bookworm — **1.14** (застарий для Phoenix 1.8). [verified: packages.debian.org] Тобто штатний `apt install elixir` **не годиться**.

**Що просити в Mirohost (найпростіший шлях):**
- свіжий **Erlang/OTP** (24+, напр. `esl-erlang` з репозиторію Erlang Solutions)
- актуальний **Elixir** (1.15+)
- `inotify-tools` (для live-reload)

**Додатково — build-toolchain, щоб ми самі оновлювали версії через asdf/mise без нового тікета:**
```
build-essential autoconf m4 libncurses-dev libssl-dev
```
Ці назви звірені для bookworm. `inotify-tools` у bookworm = 3.22. [verified: packages.debian.org]

---

## Ruby 4.0.5 + Rails (відхилена альтернатива — для повноти)

Актуальний стабільний — **Ruby 4.0.5** (реліз 2026-05-20). [verified: ruby-lang.org] Одна команда (виконує root):

```
apt-get install -y build-essential autoconf patch \
  libssl-dev libyaml-dev libreadline-dev zlib1g-dev \
  libgmp-dev libncurses-dev libffi-dev libgdbm6 libgdbm-dev libdb-dev \
  rustc default-libmysqlclient-dev
```

- `build-essential autoconf patch` — компіляція Ruby та нативних gem-ів. [verified: ruby-build wiki]
- `libssl-dev libyaml-dev zlib1g-dev libffi-dev libgmp-dev` — обов'язковий мінімум для збірки Ruby. [verified: ruby-build «Suggested build environment»]
- `libreadline-dev` (8.2), `libncurses-dev` (6.4), `libgdbm6` (1.23) + `libgdbm-dev`, `libdb-dev` (5.3) — повна стандартна бібліотека. [verified: packages.debian.org, кожен]
- `default-libmysqlclient-dev` (1.1.0) — для gem `mysql2`. [verified: packages.debian.org]
- `rustc` — bookworm дає **1.63**. Достатньо для **YJIT** (робочий JIT). Для нового **ZJIT** треба Rust **1.85+**, якого в apt нема — але ZJIT експериментальний і не для продакшену; за потреби новіший Rust ставиться userland через `rustup` без root. [verified: ruby-lang release notes; packages.debian.org rustc 1.63]

Після встановлення рантайму ми самі: rbenv/ruby-build → Ruby в домашню теку → bundler → Rails → Puma.

---

## Що встановлювати не треба

- **Redis** — не потрібен (Next.js ISR кешує на файловій системі; один сервер). У панелі Mirohost як послуга не пропонується; за потреби — окремий запит до support. [verified: Next.js docs; read панелі]
- **Node / Python** — уже стоять.
- **PostgreSQL** — недоступний без root; архітектура на MySQL.
