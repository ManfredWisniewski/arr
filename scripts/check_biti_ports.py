#!/usr/bin/env python3
"""Check (or apply) component ports from the biti submodule into src/.

biti is the design/template repo; nothing in src/ imports it — ported
files are copies with mechanical adaptations. This script warns when a
ported biti source has changed since the port (its recorded sha256
drifts) and can re-apply the port: copy + the transform rules recorded
in scripts/biti-ports.json.

Usage:
    python scripts/check_biti_ports.py           # warn on stale ports
    python scripts/check_biti_ports.py --apply   # re-port stale files
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "scripts" / "biti-ports.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_manifest() -> dict:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return data.get("ports", [])


def apply_port(port: dict, src: Path, dst: Path) -> None:
    text = src.read_text(encoding="utf-8")
    for pattern, repl in port.get("regex", []):
        text = re.sub(pattern, repl, text, flags=re.DOTALL)
    for old, new in port.get("strings", []):
        text = text.replace(old, new)
    dst.write_text(text, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--apply", action="store_true", help="re-port stale files")
    args = ap.parse_args()

    stale = []
    for port in load_manifest():
        src, dst = ROOT / port["src"], ROOT / port["dst"]
        if not src.exists():
            print(f"biti-ports: source missing: {port['src']}")
            continue
        if not dst.exists():
            print(f"biti-ports: dst missing: {port['dst']}")
            stale.append(port)
            continue
        current = sha256(src)
        if current != port.get("sha256"):
            print(
                f"biti-ports: STALE {port['src']} -> {port['dst']}"
                f" (biti changed since the port)"
            )
            stale.append((port, src, dst, current))

    if not stale:
        print("biti-ports: all ports up to date")
        return 0

    if not args.apply:
        print(
            "biti-ports: run `make biti-port` to re-port, or port manually "
            "and update scripts/biti-ports.json"
        )
        return 0

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for port, src, dst, current in stale:
        apply_port(port, src, dst)
        for entry in manifest["ports"]:
            if entry["src"] == port["src"]:
                entry["sha256"] = current
        print(f"biti-ports: ported {port['src']} -> {port['dst']}")
    MANIFEST.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print("biti-ports: verify with `npx tsc --noEmit` and eslint")
    return 0


if __name__ == "__main__":
    sys.exit(main())
