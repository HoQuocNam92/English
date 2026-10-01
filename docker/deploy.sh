#!/usr/bin/env bash
set -euo pipefail
sha="${1:?Full release commit SHA required}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 1
cd /opt/techenglish/repo
git fetch origin main
git merge-base --is-ancestor "$sha" origin/main
git checkout --detach "$sha"
# Host .env.compose contains image registry names, DB credentials and public URLs.
set -a
source /opt/techenglish/.env.compose
set +a
: "${IMAGE_PREFIX:?Set IMAGE_PREFIX, e.g. ghcr.io/hoquocnam92/english}"
export API_IMAGE="$IMAGE_PREFIX-api:$sha"
export WEB_IMAGE="$IMAGE_PREFIX-web:$sha"
docker compose --env-file /opt/techenglish/.env.compose pull db migrate api web
docker compose --env-file /opt/techenglish/.env.compose run --rm migrate
docker compose --env-file /opt/techenglish/.env.compose up -d --no-build --wait api web
docker compose --env-file /opt/techenglish/.env.compose ps
