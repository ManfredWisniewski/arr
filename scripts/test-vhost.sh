#!/usr/bin/env bash
# Build/update the arr test vhost and run the deferred verification
# (docker-dependent part of `npm run test:int` + ./scripts/test-image.sh).
#
# The vhost is reset periodically — nothing may be assumed preinstalled.
# This script is idempotent: it installs missing prerequisites, replaces
# the checkout wholesale and runs the verification suite.
#
# Usage:
#   ./scripts/test-vhost.sh
#
# Overrides:
#   TEST_VHOST_SSH  ssh target      (default: root@devansible.wit)
#   ARR_TEST_DIR    remote workdir  (default: /opt/arr — wiped on every run)
set -euo pipefail

VHOST="${TEST_VHOST_SSH:-root@devansible.wit}"
REMOTE_DIR="${ARR_TEST_DIR:-/opt/arr}"

cd "$(dirname "$0")/.."

step() { printf '\n==> %s\n' "$*"; }

SSH="ssh -o BatchMode=yes -o ConnectTimeout=10"

step "Checking ssh access to $VHOST"
$SSH "$VHOST" true || {
  echo "Cannot reach $VHOST non-interactively — set up key auth or TEST_VHOST_SSH." >&2
  exit 1
}

step "Ensuring prerequisites on the vhost (installs what is missing)"
$SSH "$VHOST" 'set -e
  need=""
  command -v docker >/dev/null 2>&1 || need="$need docker.io"
  docker compose version >/dev/null 2>&1 || need="$need docker-compose-v2"
  command -v curl >/dev/null 2>&1 || need="$need curl"
  command -v tar  >/dev/null 2>&1 || need="$need tar"
  if [ -n "$need" ]; then
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq $need
  fi
  systemctl enable --now docker >/dev/null 2>&1 || true
  docker info >/dev/null
  docker compose version | head -1'

step "Replacing checkout at $VHOST:$REMOTE_DIR (vhost is reset-safe: dir is wiped)"
tar czf - \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./.git' \
  --exclude='./.env' \
  --exclude='./docs/node_modules' \
  --exclude='./docs/build' \
  --exclude='./docs/.docusaurus' \
  --exclude='./public/docs' \
  . | $SSH "$VHOST" "rm -rf '$REMOTE_DIR' && mkdir -p '$REMOTE_DIR' && tar xzf - -C '$REMOTE_DIR'"

step "Normalising shell script line endings (Windows checkouts can be CRLF)"
$SSH "$VHOST" "find '$REMOTE_DIR' -name '*.sh' -exec sed -i 's/\r\$//' {} +"

step "Writing test .env on the vhost (no local secrets are copied)"
$SSH "$VHOST" "printf 'PAYLOAD_SECRET=test-secret-not-for-production\nDATABASE_URI=postgresql://payload_test:payload_test@postgres:5432/payload_test\n' > '$REMOTE_DIR/.env'"

step "Resetting the test database schema"
$SSH "$VHOST" "cd '$REMOTE_DIR' && docker compose up -d postgres && docker compose exec -T postgres psql -U payload_test -d payload_test -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'"

step "Applying migrations (prevents parallel schema-push races on a fresh DB)"
$SSH "$VHOST" "cd '$REMOTE_DIR' && docker compose run --rm payload sh -c 'npm ci && npm run payload -- migrate'"

step "Running integration tests (Postgres via compose, deps in named volume)"
$SSH "$VHOST" "cd '$REMOTE_DIR' && docker compose run --rm payload npm run test:int"

step "Running production image smoke test (builds the image)"
$SSH "$VHOST" "cd '$REMOTE_DIR' && ./scripts/test-image.sh"

step "All vhost checks passed"
