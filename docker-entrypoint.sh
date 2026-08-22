#!/bin/sh
set -eu

RUNTIME_ENV_FILE="/app/dist/runtime-env.js"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

write_key() {
  key="$1"
  value="$(printenv "$key" 2>/dev/null || true)"
  printf '  "%s": "%s",\n' "$key" "$(json_escape "$value")" >> "$RUNTIME_ENV_FILE"
}

mkdir -p "$(dirname "$RUNTIME_ENV_FILE")"
{
  printf 'window.__GRAMPAD_ENV__ = {\n'
  write_key VITE_TONCENTER_ENDPOINT
  write_key VITE_TONCENTER_API_KEY
  write_key VITE_TON_USDT_MASTER
  write_key VITE_TON_USDT_MASTER_ADDRESS
  write_key VITE_TON_USDT_DECIMALS
  write_key VITE_LAUNCHPAD_WALLET
  write_key VITE_GRAMX_MASTER
  write_key VITE_GRAMX_DECIMALS
  write_key VITE_STAKING_CONTRACT_ADDRESS
  write_key VITE_STAKING_DEFAULT_APR_BPS
  write_key VITE_STAKING_DEFAULT_MIN_GRAMX
  write_key VITE_STAKING_DEFAULT_FLEX_FEE_BPS
  write_key VITE_UNIVERSAL_LOCKER_ADDRESS
  write_key VITE_LOCKER_DEFAULT_DECIMALS
  write_key VITE_SWAP_CONTRACT_ADDRESS
  write_key VITE_SWAP_RATE
  write_key VITE_SWAP_TON_RATE
  write_key VITE_SWAP_GRAM_SYMBOL
  printf '};\n'
} > "$RUNTIME_ENV_FILE"

exec "$@"
