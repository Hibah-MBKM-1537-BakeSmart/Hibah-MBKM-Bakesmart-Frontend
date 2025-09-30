# ---------- builder stage ----------
FROM node:alpine3.21 AS builder

# active corepack/pnpm
RUN corepack enable

WORKDIR /app

# copy package manifests first (caching)
COPY package.json pnpm-lock.yaml ./

# install pnpm
RUN npm install -g pnpm@9

# install semua dependency (dev + prod)
RUN pnpm install --frozen-lockfile

# copy rest of the source
COPY . .

# build Next.js app
RUN pnpm build

# ---------- production runner ----------
FROM node:alpine3.21 AS runner

# RUN corepack enable

WORKDIR /app
ENV NODE_ENV=production

# install pnpm
RUN npm install -g pnpm@9

# copy hanya file yang diperlukan untuk runtime
COPY package.json pnpm-lock.yaml ./

# install hanya production dependencies
RUN pnpm install --frozen-lockfile --prod

# copy build artifacts dari builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

# gunakan pnpm start (pastikan script start ada di package.json)
CMD ["pnpm", "start"]
