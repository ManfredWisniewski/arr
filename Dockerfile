# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.mjs file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22.17.0-bookworm-slim AS base

# Install dependencies only when needed
FROM base AS deps
# The Debian slim base includes the glibc runtime required by native dependencies.
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps --ignore-scripts && npm rebuild esbuild; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

RUN npx esbuild src/migrations/*.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --external:sharp \
  --banner:js='import { createRequire as __seedCreateRequire } from "module"; const require = __seedCreateRequire(import.meta.url);' \
  --outdir=migrations

RUN npx esbuild scripts/migrate.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --external:sharp \
  --banner:js='import { createRequire as __seedCreateRequire } from "module"; const require = __seedCreateRequire(import.meta.url);' \
  --outfile=migrate.js

RUN npx esbuild scripts/seed-admin.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --external:sharp \
  --banner:js='import { createRequire as __seedCreateRequire } from "module"; const require = __seedCreateRequire(import.meta.url);' \
  --outfile=seed-admin.js

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# The official Node image already provides the non-root node user (UID/GID 1000).


# Remove this line if you do not have this folder
# COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/migrations ./migrations
COPY --from=builder --chown=node:node /app/migrate.js ./migrate.js
COPY --from=builder --chown=node:node /app/seed-admin.js ./seed-admin.js
COPY --from=builder --chown=node:node /app/scripts/entrypoint.sh ./entrypoint.sh

USER node

ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
