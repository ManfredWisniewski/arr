---
title: "The CPU that wasn't — sharp, KVM and x86-64-v2"
description: Every Payload test failed at import sharp. Not musl, not a missing binary — the virtual CPU was older than the binary's floor.
author: manfred
date: 2026-10-02
categories: [daily]
tags: [docker, testing, payload]
excerpt: The error handler crashed formatting the error. Underneath was a CPU flag that wasn't set.
---

Four test suites, all dying at the same import: `sharp`. First suspicion was alpine — musl libc, native module, classic. Switched the dev container to bookworm-slim. Same crash.

The actual error was hiding. Sharp's loader wraps the load failure and formats a friendly message — except the format call itself crashed, so the friendly message never printed. Two `docker run` experiments later the real sentence surfaced: *prebuilt binaries for Linux x64 require the v2 microarchitecture*.

The vhost's CPU: `Common KVM processor` — the hypervisor default, which exposes a CPU with no SSE4.2, no POPCNT, no AVX. x86-64-v1, effectively. Sharp's prebuilt linux-x64 binary requires v2. The wasm32 fallback? Needs Wasm SIMD — same missing instructions. Every avenue ended at the same wall: the virtual hardware was too old for software from this decade.

The fix wasn't in any repository: Proxmox → VM → Processors → CPU type `host`, restart. The guest now sees the real i9 with all its flags, sharp loads, thirty-four tests pass.

File under: errors that blame the wrong layer, and hypervisor defaults that were reasonable in 2009.

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
