# ---------- builder stage ----------
FROM node:alpine3.21 AS builder

# active corepack/pnpm
RUN corepack enable

WORKDIR /app

# copy package manifests first (caching)
COPY package.json pnpm-lock.yaml ./

# install deps (will install dev deps too; needed for build)
RUN pnpm install

# copy rest of the source
COPY . .

# build Next.js app
RUN pnpm build

# ---------- production runner ----------
FROM node:alpine3.21 AS runner

ENV NODE_ENV=production
RUN corepack enable

WORKDIR /app

# copy only production artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# gunakan pnpm start (pastikan script start ada di package.json)
CMD ["pnpm", "start"]
