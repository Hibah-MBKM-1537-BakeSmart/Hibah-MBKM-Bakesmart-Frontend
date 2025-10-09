# ================================================================
# Stage 1: Instalasi dependensi (Deps)
# ================================================================
# Menggunakan base image yang spesifik untuk dependensi agar cache layer lebih efisien.
FROM node:20-alpine AS deps
WORKDIR /app

# Menginstal pnpm secara global menggunakan npm (yang sudah ada di base image)
RUN npm install -g pnpm

# (Opsional tapi direkomendasikan) Menginstal build tools yang dibutuhkan oleh beberapa paket.
RUN apk add --no-cache python3 make g++

# Menyalin file manifest yang dibutuhkan oleh pnpm.
# Jika Anda menggunakan pnpm workspaces, salin juga 'pnpm-workspace.yaml'.
COPY package.json pnpm-lock.yaml ./

# Menjalankan instalasi dependensi.
# '--frozen-lockfile' adalah ekuivalen pnpm untuk 'npm ci', memastikan instalasi sesuai lock file.
RUN pnpm install --frozen-lockfile


# ================================================================
# Stage 2: Build aplikasi (Builder)
# ================================================================
# Menggunakan base image yang sama untuk konsistensi.
FROM node:20-alpine AS builder
WORKDIR /app

# Menginstal pnpm lagi di stage ini karena setiap stage adalah environment baru.
RUN npm install -g pnpm

# Menyalin node_modules yang sudah terinstal dari stage 'deps'.
COPY --from=deps /app/node_modules ./node_modules

# Menyalin sisa kode aplikasi.
# Gunakan .dockerignore untuk menghindari penyalinan file yang tidak perlu.
COPY . .

# Mengatur environment variable untuk menonaktifkan telemetri Next.js.
ENV NEXT_TELEMETRY_DISABLED=1

# Menjalankan script build aplikasi menggunakan pnpm.
RUN pnpm run build


# ================================================================
# Stage 3: Produksi (Runner)
# ================================================================
# Menggunakan base image yang sama dan ringan. Stage ini tidak butuh pnpm.
FROM node:20-alpine AS runner
WORKDIR /app

# Mengatur environment variable untuk environment produksi.
# Menggunakan format KEY=value yang direkomendasikan.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Membuat user dan group khusus untuk aplikasi demi keamanan (prinsip least privilege).
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Menyalin hasil build dari stage 'builder'.
# Opsi '--chown' secara efisien mengubah kepemilikan file ke user 'nextjs'.
# Bagian ini tidak berubah karena hanya menyalin hasil build Next.js.
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Mengubah user ke non-root yang telah dibuat.
USER nextjs

# Mengekspos port yang digunakan oleh aplikasi.
EXPOSE 3000

# Perintah untuk menjalankan aplikasi (Next.js standalone output).
CMD ["node", "server.js"]