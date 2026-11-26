#!/usr/bin/env bash
set -euo pipefail
umask 077
src="$HOME/techenglish-ops-staging"
base="$HOME/techenglish-ops"
mkdir -p "$base"/{bin,state,generated,secrets}
cp -R "$src/docker/observability/." "$base/"
cp "$src/scripts/ops/ops.py" "$base/bin/ops.py"
find "$base/provisioning" "$base/dashboards" -type d -exec chmod 755 {} +
find "$base/provisioning" "$base/dashboards" -type f -exec chmod 644 {} +
chmod 755 "$base/generated"
chmod 644 "$base"/*.yml "$base/config.alloy"
chmod 700 "$base/bin/ops.py" "$base/state" "$base/secrets"
touch "$base/state/jobs.log"
chmod 600 "$base/state/jobs.log"
if [[ ! -s "$base/secrets/grafana-admin-password" ]]; then
  python3 - "$base" <<'PY'
import pathlib,secrets,sys
base=pathlib.Path(sys.argv[1]);password=secrets.token_urlsafe(30)
(base/'secrets/grafana-admin-password').write_text(password)
(base/'state/grafana-access.txt').write_text('Dashboard: https://techenglish.click/monitoring/\nUsername: admin\nPassword: '+password+'\n')
PY
fi
sudo chown ubuntu:472 "$base/secrets/grafana-admin-password"
chmod 640 "$base/secrets/grafana-admin-password"
touch "$base/secrets/telegram-token"
sudo chown ubuntu:65534 "$base/secrets/telegram-token"
chmod 640 "$base/secrets/telegram-token"
chmod 600 "$base/state/grafana-access.txt"
python3 -m py_compile "$base/bin/ops.py"
python3 "$base/bin/ops.py" collect
for name in collector backup restore; do
  sudo install -m 644 "$src/scripts/ops/techenglish-$name.service" "/etc/systemd/system/techenglish-$name.service"
  sudo install -m 644 "$src/scripts/ops/techenglish-$name.timer" "/etc/systemd/system/techenglish-$name.timer"
done
sudo install -m 644 "$src/scripts/ops/techenglish-observability.service" /etc/systemd/system/techenglish-observability.service
sudo install -m 644 "$src/scripts/ops/techenglish-ops.logrotate" /etc/logrotate.d/techenglish-ops
sudo systemctl daemon-reload
systemd-analyze calendar '*-*-* 02:00:00 Asia/Bangkok'
cd "$base"
docker compose -f compose.yml config --quiet
docker compose -f compose.yml pull > "$base/state/image-pull.log" 2>&1
printf 'Operations package installed; monitoring images pulled.\n'
