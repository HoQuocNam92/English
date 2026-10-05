#!/bin/bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run this installer with sudo.' >&2; exit 1; }
config_source="${1:?Usage: sudo bash install-learning-reminders.sh /absolute/path/private-reminders.curl}"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$config_source" && ! -L "$config_source" ]] || { echo 'Config file is missing or is a symlink.' >&2; exit 1; }
if grep -q 'REPLACE_WITH' "$config_source"; then
  echo 'Set the API URL and job key before installation.' >&2
  exit 1
fi
for dependency in curl flock logger stat systemctl; do
  command -v "$dependency" >/dev/null || { echo "Missing dependency: $dependency" >&2; exit 1; }
done
systemctl cat cron.service >/dev/null 2>&1 || { echo 'Install cron first: sudo apt-get install cron curl util-linux' >&2; exit 1; }
install -d -o root -g root -m 700 /etc/techenglish
install -d -o root -g root -m 755 /usr/local/lib/techenglish
if [[ "$(realpath -- "$config_source")" != /etc/techenglish/learning-reminders.curl ]]; then
  install -o root -g root -m 600 "$config_source" /etc/techenglish/learning-reminders.curl
else
  chown root:root /etc/techenglish/learning-reminders.curl
  chmod 600 /etc/techenglish/learning-reminders.curl
fi
install -o root -g root -m 755 "$script_dir/run-learning-reminders.sh" /usr/local/lib/techenglish/run-learning-reminders.sh
# Verify credentials and connectivity before enabling the schedule.
/usr/local/lib/techenglish/run-learning-reminders.sh
install -o root -g root -m 644 "$script_dir/techenglish-learning-reminders.cron" /etc/cron.d/techenglish-learning-reminders
systemctl enable --now cron.service
printf '%s\n' 'Installed reminder cron: once every minute.'
