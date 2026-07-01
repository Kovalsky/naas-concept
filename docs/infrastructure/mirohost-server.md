# Mirohost eVPS-8 Hosting — Verified Capabilities and Limitations

**What this is:** empirical facts about the server that the new portal will be deployed to. Collected in the 2026-07-01 session via direct SSH access and reading the control panel (read-only). Use as the source of truth for infrastructure decisions.

**Related:** [`../architecture/portal-architecture.md`](../architecture/portal-architecture.md), [`runtime-install-reference.md`](runtime-install-reference.md).

---

## Access

- **SSH:** `vs581.mirohost.net`, port `22`, user `bbnaasnew` (`uid=1001(naasZ4)`, group `apache`), **password** authentication (credentials in `~/.naas_hosting.env`, outside the repo). [verified: SSH login]
- IP-based access may be restricted ("Access Restriction" in the panel); our Mac already passes.
- **Panel:** `https://control.mirohost.net`, package **H-74503**.
- **Rule:** ask the user before EVERY SSH connection (strict rule). We don't log in with a key — the panel doesn't allow uploading a public key, authentication is password-based.

## System

- **OS:** Debian 12 (bookworm), container on Ubuntu kernel 6.14. [verified: `/etc/os-release`, `uname`]
- **Shell:** `/bin/bash` — full interactive shell. [verified]
- **root:** NOT AVAILABLE. `sudo` requires a password (there is no passwordless root). [verified]
- **HOME:** `/var/www/naasZ4` — **shared with the old Bitrix site** (its files and institute subdomains live there). **Do not touch the old site.** [verified: `ls ~`]
- **Disk:** `df` shows `/dev/sda3` 256 GB, ~242 GB free (6%). [verified: `df`] The eVPS-8 plan's nominal figure in the panel is 49 GB. For planning purposes it's safe to plan around 49 GB; verify the actual quota before any large-scale usage.
- **CPU/RAM:** eVPS-8 plan = **2 vCPU / 4 GB**. [verified: panel] Important for caching decisions (see architecture).
- **Outbound network:** works (HTTP 200 to nodejs.org). [verified]
- **Web server:** `nginx` is running. [verified: `ps`]

## What's Already Installed

[verified: SSH probe]
- **Node.js v20.20.2**, npm 10.8.2, npx
- **Python 3.11.2**, pip 23.0.1, `python3 -m venv` available
- **PHP 5.6.40** (old; for the old site)
- git 2.39.5, curl, wget, tar, xz
- 1262 dpkg packages total

## What's Missing (and We Can't Install Ourselves Without root)

[verified: SSH probe]
- **Compiler:** `gcc`, `cc`, `clang`, `g++`, `make`, `cmake` — missing. Consequence: native extensions can't be built from source; rely on **prebuilt binaries** (npm/pip wheels pull those in).
- **Ruby / gem**, any Ruby version managers — none.
- **Elixir / Erlang** — none (the Debian Elixir package is outdated, 1.14; a fresh one is needed — see install-reference).
- **Redis / Memcached** — none, and **not offered** as a service in the panel (verified: 0 mentions in the 161 KB order catalog, in `vs_management/daemons`, `/services`). [verified: panel read]
- Go, Deno, Bun, Java, .NET, screen, tmux, rustc — none.

## What Works Without root (Verified Empirically)

- **Userland `npm install`** of packages (pure JS + prebuilt binaries) — yes. [verified: `npm install express` + `require` OK]
- **Node server on a port** (`127.0.0.1:PORT`), listens, serves HTTP. [verified: test on :38080]
- **Python venv + pip** — yes.
- I.e., pure stacks (Next.js, Directus, Django+gunicorn+PyMySQL) start **as-is**.

## Execution Limitations

- **`crontab` is blocked** for our user (`/usr/bin/crontab: Permission denied`). [verified] → `@reboot` auto-start is unavailable.
- Therefore, process persistence is **via systemd, which Mirohost configures** (see below).

## What Mirohost Support Confirmed (Terms)

*(from support's word in correspondence — not verified by tooling)*
- **root/sudo are not granted.**
- **systemd:** we provide the service details (start command, working directory, user, port, env) → they create the unit; we're given access to **start / restart / status**. This is how persistent background processes + restart-after-reboot are handled.
- **nginx reverse proxy** to any internal port — we enable it **ourselves** in the control panel ("Nginx → proxying requests to a specific service").
- They're willing to **install system-wide** one runtime of our choice: **Ruby 4.0.5 + toolchain** OR **Erlang/OTP + Elixir + inotify-tools** (packages — in install-reference).

## Database

- **MySQL/MariaDB only** (phpMyAdmin in the panel). We can't install PostgreSQL without root → MySQL is assumed in the architecture.

## DB/Panel — Navigation (for Read-Only Reconnaissance)

The panel is an SPA (Metro 4). Key paths: `/order/H-74503` (service), `/order/H-74503/vs_management/daemons` (services/daemons), `/order/H-74503/vs_management/php_version`, `/order/H-74503/change_tariff`, `/billing_managment/create_order` (order catalog), `/services`. Read via in-page `fetch` (carries authorization), return only anonymized aggregates — MCP masks cookies/query-strings as `[BLOCKED: …]` (expected).
