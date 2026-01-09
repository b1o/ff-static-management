FROM oven/bun:1 AS base
WORKDIR /app

# Install all dependencies (monorepo)
FROM base AS deps
COPY package.json bun.lock ./
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/
RUN bun install --frozen-lockfile

# Build frontend
FROM deps AS frontend-build
COPY packages/web ./packages/web
COPY packages/server/src/types.ts ./packages/server/src/types.ts
COPY packages/server/src/app.ts ./packages/server/src/app.ts
COPY packages/server/src/db/schema.ts ./packages/server/src/db/schema.ts
RUN cd packages/web && bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Copy server package and dependencies
COPY packages/server/package.json ./
RUN bun install --frozen-lockfile --production

COPY packages/server/src ./src
COPY --from=frontend-build /app/packages/web/dist/web ./public

# Create data directory for SQLite
RUN mkdir -p ./data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/app.ts"]
