# ================================================================
# Stage 1: Instalasi dependensi (Deps)
# ================================================================
# Stage ini tetap sama, untuk caching dependensi.
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ================================================================
# Stage 2: Build aplikasi (Builder)
# ================================================================
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Setelah build selesai, hapus dependensi yang hanya untuk development.
# Ini akan membuat folder node_modules lebih kecil untuk stage produksi.
RUN pnpm prune --prod

# ================================================================
# Stage 3: Produksi (Runner) - VERSI NON-STANDALONE
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Install pnpm untuk menjalankan perintah 'pnpm start'.
RUN npm install -g pnpm

# Membuat user dan group khusus untuk keamanan.
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Menyalin hanya file-file yang dibutuhkan untuk produksi dari stage 'builder'.
# Perhatikan kita sekarang menyalin .next, node_modules (yang sudah di-prune), dan package.json.
COPY --from=builder --chown=nextjs:nextjs /app/.next ./.next
COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Mengubah user ke non-root.
USER nextjs

EXPOSE 3000

# Menjalankan aplikasi menggunakan 'pnpm start'.
CMD ["pnpm", "start"]