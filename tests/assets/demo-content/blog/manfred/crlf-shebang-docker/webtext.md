---
title: "The shebang that wasn't there — a CRLF story"
description: "exec /app/entrypoint.sh: no such file or directory — the file existed. The line ending didn't. A Windows checkout, a Docker image and one .gitattributes line."
author: manfred
date: 2026-09-25
categories: [daily]
tags: [docker, git, testing]
excerpt: The error message said the file was missing. The file was right there. The interpreter wasn't.
---

The image built fine, the container started, and then: `exec /app/entrypoint.sh: no such file or directory`. The file was right there — I could `ls` it, `cat` it, `wc -l` it. No such file, said the kernel, about a file that demonstrably existed.

The shebang. `#!/usr/bin/env bash` followed by a carriage return — Windows line endings from the local checkout, tarred up to the test host, built into the image. The kernel reads the interpreter path up to the newline, carriage return included, tries to execute `bash\r`, and reports the honest truth: no such file. The lie is in *which* file it blames.

Two fixes, one line each. `.gitattributes` now forces `*.sh text eol=lf` so the checkout can't produce CRLF shell scripts again. And the vhost test script normalizes `*.sh` to LF after syncing, because a test environment should be robust against the state of the tree it receives, not just the state it hopes for.

Fifteen years of "it works on my machine" jokes and the machine still finds new ways to win.

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
