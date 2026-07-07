#!/usr/bin/env bash
# PayFuta launcher — macOS / Linux
# Double-click (macOS: rename to launch-payfuta.command) or run from a terminal.
set -e
cd "$(dirname "$0")"

echo "============================================"
echo "  PayFuta — Namibian Payroll System"
echo "============================================"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Please install it from https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run — installing dependencies, please wait..."
  npm install
fi

echo "Starting PayFuta... your browser will open automatically."
echo "Keep this window open while using the app. Press Ctrl+C to stop."
echo
npm run dev -- --open
