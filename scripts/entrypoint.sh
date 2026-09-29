#!/bin/sh
set -eu

node /app/migrate.js
exec "$@"
