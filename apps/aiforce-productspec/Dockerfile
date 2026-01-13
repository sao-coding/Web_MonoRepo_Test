# ===========================================
# Stage 1: Turbo Prune - 只提取需要的 packages
# ===========================================
FROM node:22-alpine AS pruner

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy entire monorepo
COPY . .

# Prune - 只保留 product-spec 需要的 packages
RUN turbo prune aiforce-productspec --docker

# ===========================================
# Stage 2: Install dependencies
# ===========================================
FROM node:22-alpine AS installer

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy pruned package.json and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies (ignore-scripts to avoid postinstall failures)
RUN pnpm install --ignore-scripts

# ===========================================
# Stage 3: Build the app
# ===========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy installed node_modules and pruned source
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

# Build arguments for environment
ARG APP_ENV=production
ENV NODE_ENV=production
ENV APP_ENV=${APP_ENV}

# Build the app
RUN pnpm turbo run build --filter=aiforce-productspec

# ===========================================
# Stage 4: Production runner
# ===========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built standalone output
COPY --from=builder /app/apps/aiforce-productspec/.next/standalone ./
COPY --from=builder /app/apps/aiforce-productspec/.next/static ./apps/aiforce-productspec/.next/static
COPY --from=builder /app/apps/aiforce-productspec/public ./apps/aiforce-productspec/public

USER nextjs

EXPOSE 3002

CMD ["node", "apps/aiforce-productspec/server.js"]
