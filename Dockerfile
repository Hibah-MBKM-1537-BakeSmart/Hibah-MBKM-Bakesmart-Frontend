# ---------- builder stage ----------
FROM node:alpine3.21 AS builder

# active corepack/pnpm
RUN corepack enable

WORKDIR /app

# copy package.json & lockfile dulu (buat caching layer)
COPY package.json package-lock.json* ./

# install dependencies
RUN npm ci

# copy semua source
COPY . .

# build Next.js (output .next/)
RUN npm run build

# ---------- production runner ----------
FROM node:alpine3.21 AS runner

# RUN corepack enable

WORKDIR /app
ENV NODE_ENV=production

# copy only necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js

# port default Next.js
EXPOSE 3000

# jalankan Next.js
CMD ["npm", "start"]