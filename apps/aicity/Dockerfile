# ===========================================
# Stage 1: Turbo Prune
# ===========================================
FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune aicity --docker

# ===========================================
# Stage 2: Install dependencies
# ===========================================
FROM node:22-alpine AS installer
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/apps/aicity/prisma ./apps/aicity/prisma
RUN pnpm install --ignore-scripts

# ===========================================
# Stage 3: Build the app
# ===========================================
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

ARG NODE_ENV
ARG APP_ENV

ENV NODE_ENV=${NODE_ENV}
ENV APP_ENV=${APP_ENV}

RUN pnpm --filter=aicity exec prisma generate
RUN pnpm turbo run build --filter=aicity

# ===========================================
# Stage 4: Production runner
# ===========================================
FROM node:22-alpine AS runner
WORKDIR /app

ARG NODE_ENV
ARG APP_PORT
ARG APP_HOSTNAME

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${APP_PORT}
ENV HOSTNAME=${APP_HOSTNAME}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/aicity/.next/standalone ./
COPY --from=builder /app/apps/aicity/.next/static ./apps/aicity/.next/static
COPY --from=builder /app/apps/aicity/public ./apps/aicity/public

USER nextjs
EXPOSE ${APP_PORT}

CMD ["node", "apps/aicity/server.js"]
