#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-arr-image-test}"
COMPOSE_FILE="tests/docker-compose.image.yml"
IMAGE_UNDER_TEST="${PAYLOAD_IMAGE_UNDER_TEST:-}"
PORT="${PAYLOAD_TEST_PORT:-3011}"
BASE_URL="http://127.0.0.1:${PORT}"
SEED_EMAIL="admin@test.devansible.wit"
SEED_PASSWORD="image-test-password-not-for-production"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "$1 is required" >&2
    exit 1
  }
}

require_command docker
require_command curl

cleanup() {
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" down --volumes --remove-orphans
}
trap cleanup EXIT

export PAYLOAD_TEST_PORT="$PORT"
if [ -n "$IMAGE_UNDER_TEST" ]; then
  echo "Starting image test stack with ${IMAGE_UNDER_TEST}..."
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up --detach
else
  echo "Building and starting the image test stack..."
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up --build --detach
fi

echo "Checking the runtime user and bundled seed script..."
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" run --rm --no-deps payload \
  sh -c '[ "$(id -u)" = "1000" ] && test -f /app/seed-admin.js'

echo "Waiting for the health endpoint..."
for attempt in $(seq 1 30); do
  if curl --fail --silent "$BASE_URL/api/health" | grep -q '"status":"ok"'; then
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs payload
    exit 1
  fi
  sleep 2
done

echo "Running the admin seed twice to verify idempotence..."
for run in 1 2; do
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T \
    -e PAYLOAD_SEED_ADMIN_EMAIL="$SEED_EMAIL" \
    -e PAYLOAD_SEED_ADMIN_PASSWORD="$SEED_PASSWORD" \
    payload node seed-admin.js
done

# Schema-drift regression: a column added to the schema without a
# migration makes every query on that table 500 ("column x does not
# exist") — while /api/health still answers 200 because it never
# touches the DB. Exercise a real query per collection/global, plus
# draft reads (version tables) via the seeded admin.
echo "Checking collection queries catch missing-migration columns..."
for endpoint in \
  "api/pages?limit=1" \
  "api/posts?limit=1" \
  "api/media?limit=1" \
  "api/structures?limit=1" \
  "api/globals/theme"; do
  code=$(curl --silent --output /dev/null --write-out '%{http_code}' \
    "$BASE_URL/$endpoint")
  if [ "$code" != "200" ]; then
    echo "GET /$endpoint returned $code (want 200)" >&2
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs payload
    exit 1
  fi
done

# Frontend render exercises theme global + page lookup end to end; an
# empty DB 404s, so only a 5xx means a query/schema crash.
code=$(curl --silent --output /dev/null --write-out '%{http_code}' "$BASE_URL/")
if [ "$code" -ge 500 ]; then
  echo "GET / returned $code — frontend render crashed" >&2
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs payload
  exit 1
fi

echo "Checking draft queries against the version tables..."
COOKIE_JAR=$(mktemp)
trap 'rm -f "$COOKIE_JAR"; cleanup' EXIT
code=$(curl --silent --output /dev/null --write-out '%{http_code}' \
  --cookie-jar "$COOKIE_JAR" -X POST "$BASE_URL/api/users/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$SEED_EMAIL\",\"password\":\"$SEED_PASSWORD\"}")
if [ "$code" != "200" ]; then
  echo "POST /api/users/login returned $code (want 200)" >&2
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs payload
  exit 1
fi
for endpoint in "api/pages?draft=true&limit=1" "api/posts?draft=true&limit=1"; do
  code=$(curl --silent --output /dev/null --write-out '%{http_code}' \
    --cookie "$COOKIE_JAR" "$BASE_URL/$endpoint")
  if [ "$code" != "200" ]; then
    echo "GET /$endpoint returned $code (want 200)" >&2
    docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs payload
    exit 1
  fi
done

echo "Docker image tests passed."
