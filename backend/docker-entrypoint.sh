#!/bin/sh
# Bind-mount-tauglicher Entrypoint: stellt sicher, dass /app/data dem node-User
# gehoert, BEVOR der Server startet. Notwendig, weil ein Host-bind-mount die
# vom Dockerfile gesetzten Permissions ueberschreibt.
set -e

DATA_DIR="${DATA_DIR:-/app/data}"

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R node:node "$DATA_DIR"
  exec su-exec node:node "$@"
fi

exec "$@"
