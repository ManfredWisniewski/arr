#!/usr/bin/env bash
set -euo pipefail

IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-ghcr.io/manfredwisniewski/arr}"
PLATFORM="${PLATFORM:-linux/amd64}"
DIGEST_FILE="${DIGEST_FILE:-image-digest.yml}"
CLEAN_DOCKER="${CLEAN_DOCKER:-0}"

if [[ "${1:-}" == "--cleanup" ]]; then
  CLEAN_DOCKER=1
  shift
fi

TAG="${1:-test-$(date -u +%Y%m%d-%H%M%S)}"
IMAGE="${IMAGE_REPOSITORY}:${TAG}"
LOCAL_IMAGE="arr-witconsult:publish-test"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! docker buildx version >/dev/null 2>&1; then
  echo "docker buildx is required" >&2
  exit 1
fi

if [[ "$CLEAN_DOCKER" == "1" ]]; then
  echo "Cleaning unused Docker build cache and images..."
  docker builder prune -af
  docker image prune -af
fi

echo "Building local image ${LOCAL_IMAGE}..."
docker build --tag "$LOCAL_IMAGE" .

echo "Running image tests before publishing..."
PAYLOAD_IMAGE_UNDER_TEST="$LOCAL_IMAGE" ./scripts/test-image.sh

if [[ "${SKIP_GHCR_LOGIN:-0}" == "1" ]]; then
  echo "Using the existing Docker credentials for ghcr.io..."
else
  read -r -s -p "GitHub token: " GHCR_TOKEN
  printf '\n'
  trap 'unset GHCR_TOKEN' EXIT

  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io \
    --username "${GHCR_USERNAME:-ManfredWisniewski}" \
    --password-stdin
  unset GHCR_TOKEN
  trap - EXIT
fi

echo "Publishing ${IMAGE} for ${PLATFORM}..."
docker buildx build \
  --platform "$PLATFORM" \
  --tag "$IMAGE" \
  --push \
  .

echo "Reading published image digest..."
DIGEST="$(docker buildx imagetools inspect "$IMAGE" --format '{{.Manifest.Digest}}')"

if [[ ! "$DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]]; then
  echo "Could not read a valid image digest: ${DIGEST:-<empty>}" >&2
  exit 1
fi

cat > "$DIGEST_FILE" <<EOF
payload_image_repository: "$IMAGE_REPOSITORY"
payload_image_tag: "$TAG"
payload_image_digest: "$DIGEST"
EOF

printf 'Published image: %s\nDigest file: %s\n' "$IMAGE" "$DIGEST_FILE"
