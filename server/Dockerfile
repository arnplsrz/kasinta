# ============================================
# Build Stage
# ============================================
FROM node:24-alpine AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

WORKDIR /app

# Copy dependency files (cached layer)
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY prisma.config.ts ./

# Install all dependencies (including devDependencies for build)
# Note: Using --no-frozen-lockfile because we're using monorepo lockfile
RUN pnpm install --no-frozen-lockfile

# Copy source code and Prisma schema
COPY . .

# Set dummy DATABASE_URL for Prisma generation (not used during build, only needed for schema parsing)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma Client
RUN pnpm prisma:generate

# Build TypeScript to JavaScript
RUN pnpm build

# ============================================
# Production Stage (Optimized for Fly.io)
# ============================================
FROM node:24-alpine

# Install pnpm and dumb-init for proper signal handling
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate \
    && apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY prisma.config.ts ./

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy Prisma schema and migrations (needed for prisma migrate deploy)
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copy Prisma Client generated files (custom output location)
COPY --from=builder --chown=nodejs:nodejs /app/generated ./generated

# Copy Prisma CLI and all dependencies from builder (needed for migrations at runtime)
# Since pnpm uses symlinks and a virtual store, we need to copy the entire node_modules
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Create uploads directory with proper permissions for profile photos
RUN mkdir -p uploads/profiles && chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose application port (configurable via PORT env var)
EXPOSE 4000

# Health check for Fly.io
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "const port = process.env.PORT || 4000; require('http').get('http://localhost:' + port, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start server
# Note: prisma migrate deploy applies pending migrations without prompting
CMD sh -c "node node_modules/prisma/build/index.js migrate deploy && node dist/server.js"