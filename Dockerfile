# Stage 1: Build Next.js app
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./

# install dependencies (jangan lupa --legacy-peer-deps kalau perlu)
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run app
FROM node:20-slim AS runner

WORKDIR /app

# copy only built files and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
