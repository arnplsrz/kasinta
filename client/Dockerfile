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

# Copy source code
COPY . .

# Build argument for API URL (provided by fly.toml)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js application
# Next.js will embed NEXT_PUBLIC_* env vars during build
RUN pnpm build

# ============================================
# Production Stage (Optimized for Fly.io)
# ============================================
FROM node:20-alpine

# Install pnpm and dumb-init for proper signal handling
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate \
    && apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install production dependencies only
# Note: Using --no-frozen-lockfile because we're using monorepo lockfile
RUN pnpm install --prod --no-frozen-lockfile

# Copy built Next.js application from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose application port (configurable via PORT env var)
EXPOSE 8080

# Health check for Fly.io
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "const port = process.env.PORT || 8080; require('http').get('http://localhost:' + port, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js production server
CMD ["node", "server.js"]
