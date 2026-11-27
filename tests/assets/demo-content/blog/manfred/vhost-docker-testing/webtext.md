---
title: "A test host you can burn down — the devansible vhost"
description: Why integration tests run on a dedicated Ubuntu vhost — reset-safe provisioning, real Docker, and one script that rebuilds the whole lab.
author: manfred
date: 2026-10-23
categories: [daily]
tags: [docker, testing, ci]
excerpt: The vhost gets reset regularly. The script assumes nothing and rebuilds everything — that is the entire design.
---

The arr test suite needs PostgreSQL, Docker, a registry connection and about four gigabytes of RAM for the Next build. My workstation can do it; my workstation also has opinions about port 3000 and a day job. So: `devansible.wit`, an Ubuntu VM on the LAN that exists to be broken.

One constraint shaped `scripts/test-vhost.sh`: the host gets reset. Not "might get reset" — it *is* reset, routinely, which makes it a better lab, not a worse one. The script therefore assumes nothing: checks for docker and the compose plugin, installs what's missing, wipes `/opt/arr`, re-syncs the tree (minus `node_modules`, `.next`, `.git`), writes a fresh `.env`, runs the int suite in compose, then the image smoke test.

Idempotent provisioning for a disposable host — the combination means I can be careless. Break the lab, run the script, lab's back.

The dev site also lives there now, bound to the LAN IP on port 3000. Browser-reachable, traefik-free, resettable. Exactly what a development environment should be.

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
