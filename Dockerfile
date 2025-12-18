##############################
# Stage 1: Dependencies
##############################
FROM node:22-bullseye-slim AS deps
WORKDIR /app

# Install bun
RUN npm install -g bun

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

##############################
# Stage 2: Builder
##############################
FROM node:22-bullseye-slim AS builder
WORKDIR /app

# Install bun
RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV production

RUN bun run build

##############################
# Stage 3: Runner
##############################
FROM node:22-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Install sirv-cli to serve static files
RUN npm install -g sirv-cli

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000

# Serve the dist folder
CMD ["sirv", "dist", "--host", "0.0.0.0", "--port", "3000", "--single"]
