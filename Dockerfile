# ================================================================
# Stage 1: Dependencies
# ================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm dan dependencies native
RUN npm install -g pnpm
RUN apk add --no-cache libc6-compat

# Copy dan install dependency
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile


# ================================================================
# Stage 2: Build
# ================================================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Nonaktifkan telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build aplikasi Next.js
RUN pnpm run build


# ================================================================
# Stage 3: Production runtime
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy hasil build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# Jalankan Next.js server
CMD ["pnpm", "start"]
