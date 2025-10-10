# FROM node:20-alpine AS deps
# WORKDIR /app
# RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
# RUN apk add --no-cache libc6-compat
# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install --frozen-lockfile

# FROM node:20-alpine AS builder
# WORKDIR /app
# RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
# RUN pnpm run build
# RUN ls -la .next

# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
# ENV PORT=3000
# RUN addgroup --system nodejs && adduser --system nextjs
# USER nextjs

# # Coba copy standalone, fallback ke .next penuh kalau tidak ada
# # Copy standalone if it exists
# COPY --from=builder /app/.next/standalone ./standalone
# # Fallback to copying the full .next directory
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json

# EXPOSE 3000
# CMD ["pnpm", "start"]


# Stage 1: Build the application with pnpm
FROM node:20-alpine AS builder

# Set up pnpm and add other necessary packages
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies (leverage layer caching)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy application source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm run build

# Stage 2: Create a minimal production image
FROM node:20-alpine AS runner

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create and use a non-root user for security
RUN addgroup --system nodejs && adduser --system nextjs
USER nextjs

WORKDIR /app

# Copy the standalone build output and public assets
# Standalone mode automatically includes all necessary node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Expose the port
EXPOSE 3000

# Start the application using the standalone server
CMD ["node", "server.js"]
