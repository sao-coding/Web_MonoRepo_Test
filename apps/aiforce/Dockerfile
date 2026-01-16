# ===========================================
# Stage 1: Turbo Prune - 只提取需要的 packages
# ===========================================
FROM node:22-alpine AS pruner

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy entire monorepo
COPY . .

# Prune - 只保留 aiforce 需要的 packages
RUN turbo prune aiforce --docker

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

# Copy prisma schema for postinstall
COPY --from=pruner /app/out/full/apps/aiforce/prisma ./apps/aiforce/prisma

# Install dependencies (ignore-scripts to avoid prisma generate failing)
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

# NEXT_PUBLIC 環境變數需要在 build time 設定
# 這些會被編譯進 JS bundle
ARG NEXT_PUBLIC_RD_SITE_URL
ARG NEXT_PUBLIC_LOGIN_API_URL
ARG NEXT_PUBLIC_BASE_PATH_URL=/aiforce
ARG NEXT_PUBLIC_COOKIE_DOMAIN
ARG NEXT_PUBLIC_NIM_SERVICE_API_URL
ARG NEXT_PUBLIC_PATENT_SERVICE_API_URL
ARG NEXT_PUBLIC_AI_API_URL
ARG NEXT_PUBLIC_VGA_AI_API_URL
ARG NEXT_PUBLIC_AIforce_API_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST

ENV NEXT_PUBLIC_RD_SITE_URL=${NEXT_PUBLIC_RD_SITE_URL}
ENV NEXT_PUBLIC_LOGIN_API_URL=${NEXT_PUBLIC_LOGIN_API_URL}
ENV NEXT_PUBLIC_BASE_PATH_URL=${NEXT_PUBLIC_BASE_PATH_URL}
ENV NEXT_PUBLIC_COOKIE_DOMAIN=${NEXT_PUBLIC_COOKIE_DOMAIN}
ENV NEXT_PUBLIC_NIM_SERVICE_API_URL=${NEXT_PUBLIC_NIM_SERVICE_API_URL}
ENV NEXT_PUBLIC_PATENT_SERVICE_API_URL=${NEXT_PUBLIC_PATENT_SERVICE_API_URL}
ENV NEXT_PUBLIC_AI_API_URL=${NEXT_PUBLIC_AI_API_URL}
ENV NEXT_PUBLIC_VGA_AI_API_URL=${NEXT_PUBLIC_VGA_AI_API_URL}
ENV NEXT_PUBLIC_AIforce_API_URL=${NEXT_PUBLIC_AIforce_API_URL}
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ENV NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST}

# Generate Prisma client
RUN pnpm --filter=aiforce exec prisma generate

# Build the app
RUN pnpm turbo run build --filter=aiforce

# ===========================================
# Stage 4: Production runner
# ===========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built standalone output
COPY --from=builder /app/apps/aiforce/.next/standalone ./
COPY --from=builder /app/apps/aiforce/.next/static ./apps/aiforce/.next/static
COPY --from=builder /app/apps/aiforce/public ./apps/aiforce/public
# Copy messages for next-intl translations (required at runtime)
COPY --from=builder /app/apps/aiforce/messages ./apps/aiforce/messages

# Create cache directory with correct permissions (fixes EACCES error)
RUN mkdir -p /app/apps/aiforce/.next/cache && \
    chown -R nextjs:nodejs /app/apps/aiforce/.next && \
    chown -R nextjs:nodejs /app/apps/aiforce/public

USER nextjs

EXPOSE 3001

CMD ["node", "apps/aiforce/server.js"]
