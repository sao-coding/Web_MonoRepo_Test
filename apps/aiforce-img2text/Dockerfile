# ===========================================
# Stage 1: Turbo Prune
# ===========================================
FROM node:22-alpine AS pruner

WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune aiforce-img2text --docker

# ===========================================
# Stage 2: Install dependencies
# ===========================================
FROM node:22-alpine AS installer

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --ignore-scripts

# ===========================================
# Stage 3: Build the app
# ===========================================
FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

ARG APP_ENV=production
ENV NODE_ENV=production
ENV APP_ENV=${APP_ENV}

RUN pnpm turbo run build --filter=aiforce-img2text

# ===========================================
# Stage 4: Production runner
# ===========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3006
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/aiforce-img2text/.next/standalone ./
COPY --from=builder /app/apps/aiforce-img2text/.next/static ./apps/aiforce-img2text/.next/static

# Fix permissions for nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3006

CMD ["node", "apps/aiforce-img2text/server.js"]
