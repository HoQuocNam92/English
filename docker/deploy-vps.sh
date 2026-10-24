#!/usr/bin/env bash
set -euo pipefail
umask 077

sha="${1:?Full release SHA required}"
mode="${2:-workflow_dispatch}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 1
cd "${DEPLOY_REPO_DIR:-$HOME/apps/English}"

# Serialize manual and automated deployments on the server too.
exec 9> .deploy.lock
flock -w 600 9
git diff --quiet && git diff --cached --quiet || {
  echo 'Tracked files have local changes; reconcile them before deploying.' >&2
  exit 1
}
git fetch origin main
git merge-base --is-ancestor "$sha" origin/main
if [[ "$mode" == workflow_run && "$sha" != "$(git rev-parse origin/main)" ]]; then
  echo 'Skipping superseded release; a newer commit is on main.'
  exit 0
fi
test -f .env.compose
test -f apps/api/.env
git checkout --detach "$sha"

# Credentials remain in server env files; never source them as shell code.
prefix="${IMAGE_PREFIX:-ghcr.io/hoquocnam92/english}"
export API_IMAGE="$prefix-api:$sha"
export WEB_IMAGE="$prefix-web:$sha"
compose=(docker compose --env-file .env.compose)
# This script is streamed into bash over SSH. Container commands must never
# consume that stream, otherwise the script can silently end after the backup.
"${compose[@]}" config --quiet < /dev/null
"${compose[@]}" pull db migrate api web < /dev/null
"${compose[@]}" up -d --wait db < /dev/null

mkdir -p "$HOME/techenglish-backups"
backup="$HOME/techenglish-backups/$(date -u +%Y%m%dT%H%M%SZ)-$sha.dump"
"${compose[@]}" exec -T --interactive=false db pg_dump -U techenglish -d techenglish -Fc < /dev/null > "$backup"
test -s "$backup"
"${compose[@]}" run --rm --no-deps -T migrate < /dev/null
"${compose[@]}" up -d --no-build --no-deps --wait api web < /dev/null
for service in api web; do
  container_id=$("${compose[@]}" ps -q "$service" < /dev/null)
  expected="$prefix-$service:$sha"
  actual=$(docker inspect --format '{{.Config.Image}}' "$container_id" < /dev/null)
  [[ "$actual" == "$expected" ]] || {
    echo "Wrong release for $service: expected $expected, got $actual" >&2
    exit 1
  }
done
"${compose[@]}" ps < /dev/null
echo "Deployed $sha; database backup: $backup"
