# ---------- builder stage ----------
FROM node:20 AS builder

# active corepack/pnpm
RUN corepack enable

WORKDIR /app

# copy package.json & lockfile dulu (buat caching layer)
COPY package.json package-lock.json* ./

# bersihin cache & install deps
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# copy semua source
COPY . .

# build Next.js (output .next/)
RUN npm run build

# ---------- production runner ----------
FROM node:20-slim AS runner

# RUN corepack enable

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
