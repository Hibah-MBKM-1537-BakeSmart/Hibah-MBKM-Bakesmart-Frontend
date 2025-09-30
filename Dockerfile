# Stage 1: Build Next.js app
FROM node:20 AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install ALL dependencies (termasuk devDependencies, supaya ada "next")
RUN npm install

# Copy seluruh source code
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Production image
FROM node:20-slim AS runner

WORKDIR /app

# Copy hanya yang dibutuhkan dari builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
