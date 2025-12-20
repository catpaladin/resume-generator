# Stage 1: Dependencies
FROM oven/bun:1.2-slim AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:1.2-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

# Stage 3: Runtime (Distroless Bun)
FROM oven/bun:distroless

WORKDIR /app

# Copy necessary files for the runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api-server.ts ./
COPY --from=builder /app/package.json ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the API server
ENTRYPOINT ["bun", "run", "api-server.ts"]
