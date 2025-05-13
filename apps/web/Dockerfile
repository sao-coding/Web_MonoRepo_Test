# 使用 Node.js 22-slim 作為基礎映像
FROM node:22-slim AS base

# 設定 pnpm 安裝與核心設定
FROM base AS pnpm-base
ENV PNPM_HOME="/pnpm" 
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable 

# 使用 pnpm-base 建立 builder 階段
FROM pnpm-base AS builder
WORKDIR /builder

# 複製專案檔案並進行修剪
COPY . . 
RUN pnpm add -g turbo && turbo prune web --docker

# 建立 installer 階段，安裝依賴
FROM pnpm-base AS installer
WORKDIR /app
COPY --from=builder /builder/out/json/ .

# 使用快取管理以加速安裝
RUN --mount=type=cache,target=${PNPM_HOME} pnpm config set store-dir ${PNPM_HOME} 
RUN --mount=type=cache,target=${PNPM_HOME} pnpm install --frozen-lockfile --prefer-offline --ignore-scripts 

# 複製完整專案檔案
COPY --from=builder /builder/out/full/ .

# 使用 Turbo Token 進行構建
ARG TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN

# 印出目錄結構 tree 排除 node_modules .next
RUN apt-get update && apt-get install -y tree && \
    tree -a -I 'node_modules|.next' .

RUN --mount=type=secret,id=TURBO_TOKEN \
    if [ -f /run/secrets/TURBO_TOKEN ]; then \
        echo "Building with TURBO_TOKEN" && \
        TURBO_TOKEN=$(cat /run/secrets/TURBO_TOKEN) pnpm build; \
    else \
        echo "Building without TURBO_TOKEN" && \
        pnpm build --filter=web; \
    fi

# 建立 runner 階段，運行應用程式
FROM base AS runner
WORKDIR /app

# 設定 nodejs 使用者
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs 
USER nextjs 

# 複製所需檔案並設定所有者
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./ 
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# 開放埠口並啟動應用程式
EXPOSE 3000
CMD node apps/web/server.js
