# Stage 1: Build Next.js app
# Menggunakan versi node yang lebih spesifik untuk konsistensi
FROM node:20.11.1 AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install ALL dependencies dengan alokasi memori tambahan
# INI ADALAH PERBAIKANNYA: Menambahkan NODE_OPTIONS
RUN NODE_OPTIONS="--max-old-space-size=4096" npm ci --legacy-peer-deps

# Copy seluruh source code
COPY . .

# Build Next.js
# Pastikan Anda punya script "build" di package.json
RUN npm run build

# Stage 2: Production image
FROM node:20.11.1-slim AS runner

WORKDIR /app

# Di stage production, sebaiknya tidak dijalankan sebagai root user
# Membuat user baru bernama "nextjs"
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy hanya yang dibutuhkan dari builder dan set ownership ke user baru
COPY --from=builder /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copy node_modules setelah production dependencies diinstall
COPY --from=builder /app/node_modules ./node_modules

# Ganti user ke non-root
USER nextjs

EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]