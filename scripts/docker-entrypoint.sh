#!/bin/sh
set -e

echo "Waiting for database (if any)..."
# Optional sleep to allow DB to settle in non-healthcheck environments
sleep 1

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database (optional)..."
node prisma/seed.mjs || echo "Seed skipped or failed."

echo "Starting Next.js app..."
npm start