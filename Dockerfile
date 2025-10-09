# Stage 1: Instalasi dependensi
# Menggunakan base image yang spesifik untuk dependensi agar cache layer lebih efisien.
FROM node:20-alpine AS deps
WORKDIR /app

# Menyalin hanya package.json dan lock file terlebih dahulu
COPY package.json package-lock.json ./
# Menggunakan 'npm ci' yang lebih cepat dan direkomendasikan untuk environment CI/CD
RUN npm ci

# ----------------------------------------------------------------

# Stage 2: Build aplikasi
# Menggunakan base image yang sama untuk konsistensi.
FROM node:20-alpine AS builder
WORKDIR /app

# Menyalin node_modules dari stage 'deps'
COPY --from=deps /app/node_modules ./node_modules
# Menyalin sisa kode aplikasi. Gunakan .dockerignore untuk menghindari penyalinan file yang tidak perlu.
COPY . .

# Mengatur environment variable untuk menonaktifkan telemetri Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Menjalankan script build aplikasi
RUN npm run build

# ----------------------------------------------------------------

# Stage 3: Produksi
# Menggunakan base image yang sama dan ringan.
FROM node:20-alpine AS runner
WORKDIR /app

# Mengatur environment variable untuk environment produksi
# NODE_ENV=production sangat penting untuk performa
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# Mengatur hostname agar server bisa diakses dari luar container
ENV HOSTNAME 0.0.0.0
# Port yang akan digunakan oleh aplikasi
ENV PORT 3000

# Membuat user dan group khusus untuk aplikasi demi keamanan (prinsip least privilege)
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Menyalin hasil build dari stage 'builder'.
# Opsi '--chown' secara efisien mengubah kepemilikan file ke user 'nextjs' tanpa perlu layer tambahan.
# Ini adalah perbaikan paling penting dari sisi keamanan.
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Mengubah user ke non-root yang telah dibuat
USER nextjs

# Mengekspos port yang digunakan oleh aplikasi
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["node", "server.js"]