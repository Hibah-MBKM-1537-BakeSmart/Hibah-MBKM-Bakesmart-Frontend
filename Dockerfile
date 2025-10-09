# ================================================================
# Stage 1: Dependencies
# ================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm dan dependensi sistem
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
RUN apk add --no-cache libc6-compat

# Salin hanya file yang dibutuhkan untuk install
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile


# ================================================================
# Stage 2: Build (Standalone Mode)
# ================================================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

# Copy hasil install dependensi
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# ✅ Gunakan standalone build agar runtime lebih kecil
RUN pnpm run build

# ================================================================
# Stage 3: Production runtime (super kecil)
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# ✅ Copy hanya hasil standalone (lebih ringan)
COPY --from=builder /app/.next/standalone ./        
# kode server
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

# Jalankan server Next.js standalone
CMD ["node", "server.js"]
