#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-arr-witconsult-image-test}"
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

echo "Docker image tests passed."
