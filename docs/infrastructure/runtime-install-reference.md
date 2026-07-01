# Installing Runtimes on the Server (Debian 12 bookworm) — Reference

**What this is:** verified lists of system packages for installing runtimes on our server (Debian 12). Installed by **Mirohost support** (we don't have root). Package names are verified specifically for bookworm.

**Related:** [`mirohost-server.md`](mirohost-server.md), [`../architecture/portal-architecture.md`](../architecture/portal-architecture.md).

**Already present, no need to install:** Node.js v20 + npm, Python 3.11 + pip + venv, git. In other words, **Phase 1 (Next.js + Directus) requires no installations at all.** This reference covers the runtimes we don't have (Elixir for Phase 2; Ruby — as a rejected alternative, kept here for completeness).

---

## Elixir / Phoenix (Phase 2 — target backend)

The current **Phoenix v1.8.8** requires **Elixir 1.15+** and **Erlang/OTP 24+**. Node is not required for Phoenix (esbuild is built in). We install Phoenix itself via `mix archive.install hex phx_new`. The DB driver (`myxql`) is pure Elixir, no system libraries needed. [verified: phoenix.hexdocs.pm/installation]

**Important:** the Debian package `elixir` in bookworm is **1.14** (too old for Phoenix 1.8). [verified: packages.debian.org] So the standard `apt install elixir` **will not work**.

**What to request from Mirohost (the simplest route):**
- a recent **Erlang/OTP** (24+, e.g. `esl-erlang` from the Erlang Solutions repository)
- a current **Elixir** (1.15+)
- `inotify-tools` (for live-reload)

**Additionally — a build toolchain, so we can update versions ourselves via asdf/mise without a new ticket:**
```
build-essential autoconf m4 libncurses-dev libssl-dev
```
These names are verified for bookworm. `inotify-tools` in bookworm = 3.22. [verified: packages.debian.org]

---

## Ruby 4.0.5 + Rails (rejected alternative — for completeness)

The current stable release is **Ruby 4.0.5** (released 2026-05-20). [verified: ruby-lang.org] One command (run by root):

```
apt-get install -y build-essential autoconf patch \
  libssl-dev libyaml-dev libreadline-dev zlib1g-dev \
  libgmp-dev libncurses-dev libffi-dev libgdbm6 libgdbm-dev libdb-dev \
  rustc default-libmysqlclient-dev
```

- `build-essential autoconf patch` — for compiling Ruby and native gems. [verified: ruby-build wiki]
- `libssl-dev libyaml-dev zlib1g-dev libffi-dev libgmp-dev` — the mandatory minimum for building Ruby. [verified: ruby-build "Suggested build environment"]
- `libreadline-dev` (8.2), `libncurses-dev` (6.4), `libgdbm6` (1.23) + `libgdbm-dev`, `libdb-dev` (5.3) — the full standard library. [verified: packages.debian.org, each]
- `default-libmysqlclient-dev` (1.1.0) — for the `mysql2` gem. [verified: packages.debian.org]
- `rustc` — bookworm provides **1.63**. Sufficient for **YJIT** (the production JIT). The newer **ZJIT** needs Rust **1.85+**, which isn't in apt — but ZJIT is experimental and not for production; if needed, a newer Rust can be installed userland via `rustup` without root. [verified: ruby-lang release notes; packages.debian.org rustc 1.63]

After the runtime is installed, we handle the rest ourselves: rbenv/ruby-build → Ruby into the home directory → bundler → Rails → Puma.

---

## What doesn't need to be installed

- **Redis** — not needed (Next.js ISR caches on the filesystem; single server). Not offered as a service in the Mirohost panel; if needed, a separate request to support. [verified: Next.js docs; panel read]
- **Node / Python** — already installed.
- **PostgreSQL** — unavailable without root; the architecture is on MySQL.
