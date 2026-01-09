FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies (skip postinstall, we'll build types manually)
FROM base AS deps
COPY package.json bun.lock ./
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/
RUN bun install --frozen-lockfile --ignore-scripts

# Build types and frontend
FROM deps AS frontend-build
# Copy server source for type generation
COPY packages/server ./packages/server
COPY tsconfig.json ./
# Build types first (needed by frontend)
RUN bun run build:types
# Copy and build frontend
COPY packages/web ./packages/web
RUN cd packages/web && bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Copy server package and install prod dependencies
COPY packages/server/package.json ./
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY packages/server/src ./src
COPY --from=frontend-build /app/packages/web/dist/web ./public

# Create data directory for SQLite
RUN mkdir -p ./data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/app.ts"]
