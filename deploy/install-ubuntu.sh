#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer as root: sudo bash deploy/install-ubuntu.sh"
  exit 1
fi

APP_SOURCE="${APP_SOURCE:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_ROOT="/opt/luminara/current"
DATA_DIR="/var/lib/luminara"
BACKUP_DIR="/var/backups/luminara"
ENV_FILE="/etc/luminara.env"
DOMAIN="${DOMAIN:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"
SERVER_IP="${SERVER_IP:-}"
NODE_VERSION="${NODE_VERSION:-$(tr -d '[:space:]' <"${APP_SOURCE}/.node-version" 2>/dev/null || true)}"
NODE_MIRROR="${NODE_MIRROR:-https://npmmirror.com/mirrors/node}"
NODE_ROOT="/opt/node"
NODE_BIN="/usr/local/bin/node"

if [[ -n "${DOMAIN}" && ! "${DOMAIN}" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "DOMAIN contains unsupported characters."
  exit 1
fi

if [[ ! -f "${APP_SOURCE}/server.mjs" || ! -f "${APP_SOURCE}/index.html" ]]; then
  echo "APP_SOURCE must point to the Luminara project directory."
  exit 1
fi

echo "[1/8] Installing system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl nginx certbot python3-certbot-nginx rsync sqlite3 tar xz-utils

echo "[2/8] Installing Node.js ${NODE_VERSION}"
if [[ -z "${NODE_VERSION}" ]]; then
  echo "Unable to determine the required Node.js version from .node-version."
  exit 1
fi

case "$(dpkg --print-architecture)" in
  amd64) NODE_ARCH="x64" ;;
  arm64) NODE_ARCH="arm64" ;;
  *)
    echo "Unsupported server architecture: $(dpkg --print-architecture)"
    exit 1
    ;;
esac

NODE_ARCHIVE="node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
NODE_INSTALL_DIR="${NODE_ROOT}/node-v${NODE_VERSION}-linux-${NODE_ARCH}"
if [[ ! -x "${NODE_INSTALL_DIR}/bin/node" ]]; then
  NODE_TEMP="$(mktemp -d)"
  trap 'rm -rf "${NODE_TEMP}"' EXIT
  NODE_DOWNLOADED=0

  for mirror in "${NODE_MIRROR}" "https://nodejs.org/dist"; do
    echo "Downloading Node.js from ${mirror}"
    if ! curl -fsSL --connect-timeout 10 --max-time 180 \
      "${mirror}/v${NODE_VERSION}/SHASUMS256.txt" \
      -o "${NODE_TEMP}/SHASUMS256.txt"; then
      continue
    fi
    EXPECTED_SHA="$(awk -v file="${NODE_ARCHIVE}" '$2 == file { print $1 }' "${NODE_TEMP}/SHASUMS256.txt")"
    if [[ -z "${EXPECTED_SHA}" ]]; then
      continue
    fi
    if ! curl -fsSL --retry 2 --connect-timeout 10 --max-time 600 \
      "${mirror}/v${NODE_VERSION}/${NODE_ARCHIVE}" \
      -o "${NODE_TEMP}/${NODE_ARCHIVE}"; then
      continue
    fi
    if ! printf '%s  %s\n' "${EXPECTED_SHA}" "${NODE_TEMP}/${NODE_ARCHIVE}" \
      | sha256sum --check --status; then
      echo "The Node.js download failed checksum verification."
      continue
    fi
    install -d -m 0755 "${NODE_ROOT}"
    tar -xJf "${NODE_TEMP}/${NODE_ARCHIVE}" -C "${NODE_ROOT}"
    NODE_DOWNLOADED=1
    break
  done

  rm -rf "${NODE_TEMP}"
  trap - EXIT
  if [[ "${NODE_DOWNLOADED}" -ne 1 ]]; then
    echo "Node.js could not be downloaded. Set NODE_MIRROR to a reachable mirror and retry."
    exit 1
  fi
fi

install -d -m 0755 /usr/local/bin
ln -sfn "${NODE_INSTALL_DIR}/bin/node" "${NODE_BIN}"
for binary in npm npx corepack; do
  if [[ -x "${NODE_INSTALL_DIR}/bin/${binary}" ]]; then
    ln -sfn "${NODE_INSTALL_DIR}/bin/${binary}" "/usr/local/bin/${binary}"
  fi
done
"${NODE_BIN}" --version

echo "[3/8] Creating application user and directories"
if ! id luminara >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin luminara
fi
install -d -o luminara -g luminara -m 0750 "${APP_ROOT}" "${DATA_DIR}" "${BACKUP_DIR}"

echo "[4/8] Copying the application"
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

if [[ ! -f "${ENV_FILE}" ]]; then
  PUBLIC_IP="${SERVER_IP:-}"
  if [[ -z "${PUBLIC_IP}" ]]; then
    for ip_service in "https://api.ipify.org" "https://ifconfig.me/ip" "https://ipinfo.io/ip"; do
      PUBLIC_IP="$(curl -fsS --max-time 8 "${ip_service}" 2>/dev/null | tr -d '[:space:]' || true)"
      if [[ -n "${PUBLIC_IP}" ]]; then
        break
      fi
    done
  fi
  if [[ -n "${DOMAIN}" ]]; then
    BASE_URL="https://${DOMAIN}"
  elif [[ -n "${PUBLIC_IP}" ]]; then
    BASE_URL="http://${PUBLIC_IP}"
  else
    BASE_URL="http://localhost:4173"
  fi

  cat >"${ENV_FILE}" <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=4173
DATA_DIR=${DATA_DIR}
BASE_URL=${BASE_URL}
PUBLIC_ORIGINS=${BASE_URL}
TRUST_PROXY=1

# Configure these when payments and merchant email are ready.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ORDER_NOTIFY_EMAIL=
ORDER_FROM_EMAIL=
EOF
  chown root:luminara "${ENV_FILE}"
  chmod 0640 "${ENV_FILE}"
else
  if [[ -n "${DOMAIN}" ]]; then
    BASE_URL="https://${DOMAIN}"
    sed -i "s|^BASE_URL=.*|BASE_URL=${BASE_URL}|" "${ENV_FILE}"
    sed -i "s|^PUBLIC_ORIGINS=.*|PUBLIC_ORIGINS=${BASE_URL}|" "${ENV_FILE}"
  fi
  if ! grep -q "^TRUST_PROXY=" "${ENV_FILE}"; then
    printf '\nTRUST_PROXY=1\n' >>"${ENV_FILE}"
  fi
fi

echo "[5/8] Installing the systemd services"
sed "s|__APP_ROOT__|${APP_ROOT}|g; s|__ENV_FILE__|${ENV_FILE}|g; s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_SOURCE}/deploy/luminara.service" >"/etc/systemd/system/luminara.service"
sed "s|__APP_ROOT__|${APP_ROOT}|g" \
  "${APP_SOURCE}/deploy/luminara-backup.service" >"/etc/systemd/system/luminara-backup.service"
install -m 0644 \
  "${APP_SOURCE}/deploy/luminara-backup.timer" \
  "/etc/systemd/system/luminara-backup.timer"
systemctl daemon-reload
systemctl enable --now luminara
systemctl enable --now luminara-backup.timer

echo "[6/8] Installing the Nginx virtual host"
NGINX_SERVER_NAME="${DOMAIN:-_}"
sed "s|__DOMAIN__|${NGINX_SERVER_NAME}|g" \
  "${APP_SOURCE}/deploy/luminara.nginx.conf" >"/etc/nginx/sites-available/luminara"
ln -sfn /etc/nginx/sites-available/luminara /etc/nginx/sites-enabled/luminara
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "[7/8] Checking the application"
for _ in {1..20}; do
  if curl -fsS http://127.0.0.1/api/health >/dev/null; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1/api/health
echo

if [[ -n "${DOMAIN}" && -n "${LETSENCRYPT_EMAIL}" ]]; then
  echo "[8/8] Installing the HTTPS certificate"
  certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${LETSENCRYPT_EMAIL}" --redirect
else
  echo "[8/8] HTTPS skipped (DOMAIN and LETSENCRYPT_EMAIL are required)"
fi

echo
echo "Luminara is running."
echo "Application: ${APP_ROOT}"
echo "Database: ${DATA_DIR}/luminara.db"
echo "Environment: ${ENV_FILE}"
echo "Daily backups: systemctl list-timers luminara-backup.timer"
echo "Next: point the domain DNS A record at this server and allow TCP 80/443 in the cloud firewall."
