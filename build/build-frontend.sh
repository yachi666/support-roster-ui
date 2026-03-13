#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${DIST_DIR:-${PROJECT_ROOT}/dist}"
VITE_API_BASE_URL_VALUE="${VITE_API_BASE_URL:-https://supportui.servier/api}"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed or not in PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH." >&2
  exit 1
fi

echo "==> Project root: ${PROJECT_ROOT}"
echo "==> Build output: ${DIST_DIR}"
echo "==> API base URL: ${VITE_API_BASE_URL_VALUE}"

cd "${PROJECT_ROOT}"

npm ci
VITE_API_BASE_URL="${VITE_API_BASE_URL_VALUE}" npm run build

if [ ! -f "${DIST_DIR}/index.html" ]; then
  echo "Error: build completed but ${DIST_DIR}/index.html was not found." >&2
  exit 1
fi

echo "==> Build completed successfully."
echo "==> Upload the dist directory to your Linux server, for example:"
echo "    rsync -avz --delete \"${DIST_DIR}/\" user@your-server:/var/www/support-roster-ui/releases/20260313-1/"

