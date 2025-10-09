# ================================================================
# Stage 1: Instalasi dependensi (Deps)
# ================================================================
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
# Install semua dependensi, termasuk devDependencies untuk build
RUN pnpm install --frozen-lockfile

# ================================================================
# Stage 2: Build aplikasi (Builder)
# ================================================================
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pastikan next.config.js sudah memiliki output: 'standalone'
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build
# Tidak perlu 'pnpm prune' lagi, karena standalone sudah mengurusnya

# ================================================================
# Stage 3: Produksi (Runner) - VERSI STANDALONE (JAUH LEBIH KECIL)
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Membuat user dan group khusus untuk keamanan.
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Menyalin hasil build 'standalone'
# Ini adalah bagian kuncinya. Folder ini berisi server.js dan node_modules yang sudah di-prune otomatis.
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./

# Menyalin aset statis dan publik
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs

EXPOSE 3000

# Menjalankan aplikasi dari folder standalone.
# Perintahnya sekarang berbeda, tidak lagi pakai 'pnpm start'.
CMD ["node", "server.js"]