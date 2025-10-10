# ================================================================
# Stage 1: Dependencies
# ================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm dan sistem dependencies
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
RUN apk add --no-cache libc6-compat

# Salin file penting untuk install dependensi
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile


# ================================================================
# Stage 2: Build (Next.js 15)
# ================================================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Pastikan standalone aktif
RUN pnpm run build

# ================================================================
# Stage 3: Production runtime
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Buat user non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy hasil build standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000

# Jalankan Next.js (cek lokasi server.js)
CMD ["node", "server.js"]
