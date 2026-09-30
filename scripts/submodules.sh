#!/usr/bin/env bash
# Per-submodule pull/push/status — avoids submodule.recurse rebase failures.
# Usage: scripts/submodules.sh [status|pull|push]
set -u

submodules() {
    git submodule foreach --recursive --quiet 'echo "$displaypath|$PWD"' \
        2>/dev/null
}

dirty() {
    test -n "$(git -C "$1" status --porcelain)"
}

ahead() {
    upstream=$(git -C "$1" rev-parse --abbrev-ref '@{u}' 2>/dev/null) || return 1
    test -n "$(git -C "$1" log --oneline "@{u}..HEAD" 2>/dev/null)"
}

do_status() {
    submodules | while IFS='|' read -r name dir; do
        state="clean"
        dirty "$dir" && state="dirty"
        ahead "$dir" && state="$state unpushed"
        printf '%-30s %s\n' "$name" "$state"
    done
}

do_pull() {
    submodules | while IFS='|' read -r name dir; do
        if dirty "$dir"; then
            echo "SKIP  $name (dirty)"
            continue
        fi
        echo "PULL  $name"
        git -C "$dir" pull --ff-only --tags || echo "FAIL  $name"
    done
}

do_push() {
    # deepest first so nested pointers can be committed before parents push
    submodules | tac | while IFS='|' read -r name dir; do
        if dirty "$dir"; then
            echo "SKIP  $name (dirty — commit it first)"
            continue
        fi
        if ahead "$dir"; then
            echo "PUSH  $name"
            git -C "$dir" push || echo "FAIL  $name"
        else
            echo "OK    $name (nothing to push)"
        fi
    done
    if git status --porcelain | grep -q '^[MARD ]*[MARD]'; then
        echo "NOTE  superproject has uncommitted changes (submodule pointers?)"
    fi
}

case "${1:-status}" in
    status) do_status ;;
    pull) do_pull ;;
    push) do_push ;;
    *) echo "usage: $0 [status|pull|push]" >&2; exit 2 ;;
esac
