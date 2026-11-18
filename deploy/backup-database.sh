#!/usr/bin/env bash
set -euo pipefail

DATABASE="/var/lib/luminara/luminara.db"
BACKUP_DIR="/var/backups/luminara"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="${BACKUP_DIR}/luminara-${STAMP}.db"

if [[ "${EUID}" -eq 0 ]]; then
  install -d -o luminara -g luminara -m 0750 "${BACKUP_DIR}"
elif [[ "$(id -un)" != "luminara" ]]; then
  echo "Run this backup as root or the luminara service user."
  exit 1
else
  install -d -m 0750 "${BACKUP_DIR}"
fi

if [[ ! -f "${DATABASE}" ]]; then
  echo "Database not found: ${DATABASE}"
  exit 1
fi

sqlite3 "${DATABASE}" ".timeout 5000" ".backup '${TARGET}'"
chmod 0640 "${TARGET}"
if [[ "${EUID}" -eq 0 ]]; then
  chown luminara:luminara "${TARGET}"
fi
find "${BACKUP_DIR}" -type f -name "luminara-*.db" -mtime +30 -delete

echo "Backup created: ${TARGET}"
