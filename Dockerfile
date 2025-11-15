# Production Dockerfile for Next.js + Prisma app
FROM node:20-alpine AS base

# Install required system dependencies (if any native deps are needed add build-base)
RUN apk add --no-cache openssl

WORKDIR /app

# Install deps first (leverage Docker layer caching)
COPY package.json pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production

# Generate Prisma client and build Next.js
RUN npx prisma generate && npm run build

# Ensure entrypoint is executable
RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["scripts/docker-entrypoint.sh"]