# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

WORKDIR /app

# Copy dependency files (cached layer)
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install all dependencies (including devDependencies for build)
# Note: Using --no-frozen-lockfile because we're using monorepo lockfile
RUN pnpm install --no-frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN pnpm prisma:generate

# Copy source code and build
COPY . .
RUN pnpm build

# ============================================
# Production Stage (Optimized for Fly.io)
# ============================================
FROM node:20-alpine

# Install pnpm and dumb-init for proper signal handling
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate \
    && apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Copy Prisma schema first (needed for client generation)
COPY prisma ./prisma

# Install ALL dependencies (we need prisma CLI for migrations at runtime)
# Note: Not using --prod because we need 'prisma' CLI for migrations
# Note: Using --no-frozen-lockfile because we're using monorepo lockfile
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma:generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory (Fly.io volume will mount here)
RUN mkdir -p /app/uploads/profiles

# Set ownership after all files are copied
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port (configurable via PORT env var)
EXPOSE 8080

# Health check for Fly.io (uses PORT env var, defaults to 8080)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "const port = process.env.PORT || 8080; require('http').get('http://localhost:' + port + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly (important for graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start server
CMD ["sh", "-c", "pnpm prisma:deploy && pnpm start"]
