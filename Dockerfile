# ---------- builder stage ----------
FROM node:alpine3.21 AS builder

# active corepack/pnpm
RUN corepack enable

WORKDIR /app

# aktifkan corepack & set versi pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# copy package manifests dulu (biar caching jalan)
COPY package.json pnpm-lock.yaml ./

# install dependencies
RUN pnpm install

# copy semua source
COPY . .

# build app (misal Next.js atau Node build)
RUN pnpm build

# ---------- production runner ----------
FROM node:alpine3.21 AS runner

# RUN corepack enable

ENV NODE_ENV=production
WORKDIR /app

# aktifkan corepack & pnpm di runner
RUN corepack enable && corepack prepare pnpm@9 --activate

# copy hasil build + deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# pastikan ada script "start" di package.json
CMD ["pnpm", "start"]