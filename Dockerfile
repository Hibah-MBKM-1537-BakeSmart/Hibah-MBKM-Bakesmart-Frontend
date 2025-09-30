# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# Ensure standalone output for a self-contained server
RUN npm run build

# Stage 2: Create the final production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js application
CMD ["node", "server.js"]