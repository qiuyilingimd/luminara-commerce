#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this updater as root: sudo bash deploy/update-ubuntu.sh /path/to/new-release"
  exit 1
fi

APP_SOURCE="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_ROOT="/opt/luminara/current"
ENV_FILE="/etc/luminara.env"
NODE_BIN="/usr/local/bin/node"

if [[ ! -f "${APP_SOURCE}/server.mjs" || ! -f "${APP_SOURCE}/index.html" ]]; then
  echo "The release directory does not contain the Luminara application."
  exit 1
fi

rsync -a --delete \
  --exclude=".git" \
  --exclude=".env" \
  --exclude="node_modules" \
  --exclude="outputs" \
  --exclude="data/luminara.db" \
  --exclude="data/luminara.db-shm" \
  --exclude="data/luminara.db-wal" \
  "${APP_SOURCE}/" "${APP_ROOT}/"
chown -R luminara:luminara "${APP_ROOT}"

sed "s|__APP_ROOT__|${APP_ROOT}|g; s|__ENV_FILE__|${ENV_FILE}|g; s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_SOURCE}/deploy/luminara.service" >"/etc/systemd/system/luminara.service"
sed "s|__APP_ROOT__|${APP_ROOT}|g" \
  "${APP_SOURCE}/deploy/luminara-backup.service" >"/etc/systemd/system/luminara-backup.service"
install -m 0644 \
  "${APP_SOURCE}/deploy/luminara-backup.timer" \
  "/etc/systemd/system/luminara-backup.timer"
systemctl daemon-reload
systemctl enable --now luminara-backup.timer
systemctl restart luminara

for _ in {1..20}; do
  if curl -fsS http://127.0.0.1/api/health >/dev/null; then
    curl -fsS http://127.0.0.1/api/health
    echo
    echo "Luminara update completed."
    exit 0
  fi
  sleep 1
done

echo "The update completed, but the health check failed. Check: journalctl -u luminara -n 100"
exit 1
