#!/bin/bash
set -euo pipefail
umask 077
config_path="${1:-/etc/techenglish/learning-reminders.curl}"
lock_path="${2:-/run/lock/techenglish-learning-reminders.lock}"
fail() {
  printf '%s\n' "$1" >&2
  logger -t techenglish-learning-reminders -- "$1" 2>/dev/null || true
  exit 1
}
[[ -f "$config_path" && ! -L "$config_path" ]] || fail 'Missing reminder configuration.'
[[ "$(stat -c '%a:%u' "$config_path")" == "600:$EUID" ]] || fail 'Reminder config must be owned by the runner user with mode 600.'
exec 9>"$lock_path"
flock -n 9 || exit 0
# -q disables ~/.curlrc. Secret headers are read from a private file, not argv.
if curl -q --config "$config_path" --proto '=http,https' --request POST \
  --header 'Content-Type: application/json' --data '{}' \
  --fail --silent --connect-timeout 10 --max-time 45 --output /dev/null; then
  printf '%s\n' 'Reminder job completed.'
else
  fail 'Reminder API call failed. Check API availability, job key and API logs.'
fi
