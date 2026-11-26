#!/usr/bin/env bash
set -euo pipefail
umask 077
src="$HOME/techenglish-ops-staging"
base="$HOME/techenglish-ops"
mkdir -p "$base/alertmanager"
chmod 755 "$base/alertmanager"
cp "$src/scripts/ops/ops.py" "$src/scripts/ops/backup_s3.py" "$src/scripts/ops/configure-notifications.py" "$base/bin/"
cp "$src/docker/observability/compose.yml" "$src/docker/observability/alerts.yml" "$src/docker/observability/backup-config.json" "$src/docker/observability/notifications.json" "$base/"
cp "$src/docker/observability/dashboards/techenglish.json" "$base/dashboards/"
chmod 644 "$base/compose.yml" "$base/alerts.yml" "$base/dashboards/techenglish.json"
chmod 600 "$base/backup-config.json" "$base/notifications.json"
for secret in smtp-password telegram-token-runtime; do
  touch "$base/secrets/$secret"
  sudo chown ubuntu:65534 "$base/secrets/$secret"
  chmod 640 "$base/secrets/$secret"
done
python3 -m py_compile "$base/bin/ops.py" "$base/bin/backup_s3.py" "$base/bin/configure-notifications.py"
python3 "$base/bin/ops.py" backup
python3 "$base/bin/backup_s3.py" upload
python3 "$base/bin/backup_s3.py" verify
python3 "$base/bin/ops.py" collect
python3 "$base/bin/configure-notifications.py" --no-reload
cd "$base"
docker compose -f compose.yml run --rm --no-deps --entrypoint /bin/promtool prometheus check config /etc/prometheus/prometheus.yml
docker compose -f compose.yml up -d --no-deps alertmanager
docker compose -f compose.yml restart prometheus
for file in techenglish-backup.service techenglish-restore.service techenglish-s3-sync.service techenglish-s3-sync.timer techenglish-notifications.service techenglish-notifications.path; do
 sudo install -m 644 "$src/scripts/ops/$file" "/etc/systemd/system/$file"
done
sudo systemctl daemon-reload
sudo systemctl enable --now techenglish-s3-sync.timer techenglish-notifications.path
printf 'S3 backups and configurable email/Telegram notifications installed.\n'
