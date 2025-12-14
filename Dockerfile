# -----------------------------------------------------------------------------
# Base Images
# Using specific versions for reproducible builds
# -----------------------------------------------------------------------------
FROM node:24-trixie AS node
FROM oven/bun:1.3.4-debian AS bun


# -----------------------------------------------------------------------------
# Build Dependencies Stage
# Install all dependencies using Bun for faster package resolution
# -----------------------------------------------------------------------------
FROM bun AS deps
WORKDIR /app

# Copy package files for dependency resolution
# Copying these first enables Docker layer caching - dependencies won't reinstall unless these files change
COPY package.json bun.lock ./

# Install all dependencies with frozen lockfile to ensure reproducible builds
# --frozen-lockfile prevents automatic lockfile updates that could introduce inconsistencies
RUN bun install --frozen-lockfile


# -----------------------------------------------------------------------------
# Production Dependencies Stage
# Install only production dependencies using Bun for faster package resolution
# -----------------------------------------------------------------------------
FROM bun AS prod-deps
WORKDIR /app

# Copy package files for dependency resolution
# Copying these first enables Docker layer caching - dependencies won't reinstall unless these files change
COPY package.json bun.lock ./

# Install only production dependencies with frozen lockfile to ensure reproducible builds
# --frozen-lockfile prevents automatic lockfile updates that could introduce inconsistencies
# --production excludes devDependencies to minimize final image size
RUN bun install --frozen-lockfile --production


# -----------------------------------------------------------------------------
# Build Stage
# Build the React Router application using Node.js
# -----------------------------------------------------------------------------
FROM node AS builder
WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
# Using .dockerignore to exclude unnecessary files (node_modules, .git, etc.)
COPY . .

# Environment variables for build optimization
ENV NODE_ENV=production

# Build the application
# React Router will generate optimized production build with Node.js SSR
RUN npm run build


# -----------------------------------------------------------------------------
# Production Runtime Stage
# Minimal production image with only necessary files using distroless
# -----------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner
WORKDIR /app

# Production environment configuration
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application from builder stage
# Using React Router's build output for minimal footprint (includes only required dependencies)
COPY --from=prod-deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/build ./build

# Expose application port
EXPOSE 3000

# Run the React Router server
# Using node_modules/.bin/react-router-serve which is available from @react-router/serve package
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]