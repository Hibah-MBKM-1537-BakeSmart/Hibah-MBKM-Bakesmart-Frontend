# ---------- builder stage ----------
FROM node:20 AS builder

WORKDIR /app

# copy package manifests dulu (buat caching layer)
COPY package.json package-lock.json* ./

# install semua deps (termasuk dev)
RUN npm install --legacy-peer-deps

# copy semua source
COPY . .

# build Next.js (output .next/)
RUN npm run build

# ---------- production runner ----------
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# copy only production deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
