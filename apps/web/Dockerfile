# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace packages and apps
COPY packages ./packages
COPY apps/web ./apps/web

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build web app
RUN cd apps/web && pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm for production
RUN npm install -g pnpm@8

# Copy built app from builder
COPY --from=builder /app/apps/web/dist ./dist

# Install simple HTTP server for static files
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

# Serve static files
CMD ["serve", "-s", "dist", "-l", "5173"]
