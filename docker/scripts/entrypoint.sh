#!/bin/sh
set -e

echo "RankFlo — Starting up..."

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma@6 migrate deploy --schema=./packages/db/prisma/schema.prisma 2>/dev/null || true
  echo "Migrations complete."
fi

# Run seed if SEED_ON_STARTUP is set
if [ "$SEED_ON_STARTUP" = "true" ]; then
  echo "Running seed..."
  npx tsx ./packages/db/prisma/seed.ts 2>/dev/null || true
  echo "Seed complete."
fi

echo "Starting server..."
exec "$@"
