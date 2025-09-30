# Stage 1: Build Next.js app
# Menggunakan versi node yang lebih spesifik untuk konsistensi
FROM node:20.11.1 AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install SEMUA dependencies (termasuk dev) untuk proses build
RUN NODE_OPTIONS="--max-old-space-size=4096" npm ci --legacy-peer-deps

# Copy seluruh source code
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Production image
FROM node:20.11.1-slim AS runner

WORKDIR /app

# Membuat user baru bernama "nextjs"
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy hanya package.json dan lock file
COPY --from=builder /app/package*.json ./

# --- PERBAIKAN DI SINI ---
# Install HANYA production dependencies. Ini akan membuat image lebih kecil.
RUN npm ci --omit=dev

# Copy artefak build dan public folder dari builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Ganti user ke non-root
USER nextjs

EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]