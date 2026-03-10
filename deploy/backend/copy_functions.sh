#!/bin/bash
# Копирует все handler-функции из backend/ в deploy/backend/functions/
# Запускать из корня проекта: bash deploy/backend/copy_functions.sh

PAIRS=(
  "admin-auth:admin_auth"
  "admin-stats:admin_stats"
  "apply-daily-decay:apply_daily_decay"
  "chat:chat"
  "finish-game:finish_game"
  "friends:friends"
  "game-history:game_history"
  "geo-detect:geo_detect"
  "invite-game:invite_game"
  "matchmaking:matchmaking"
  "online-move:online_move"
  "rating-settings:rating_settings"
  "send-otp:send_otp"
  "site-settings:site_settings"
  "user-check:user_check"
  "verify-otp:verify_otp"
)

mkdir -p deploy/backend/functions

for pair in "${PAIRS[@]}"; do
  SRC="${pair%%:*}"
  DST="${pair##*:}"
  if [ -f "backend/${SRC}/index.py" ]; then
    cp "backend/${SRC}/index.py" "deploy/backend/functions/${DST}.py"
    echo "Copied ${SRC} -> ${DST}.py"
  else
    echo "WARN: backend/${SRC}/index.py not found"
  fi
done

echo "Done. All functions copied to deploy/backend/functions/"
