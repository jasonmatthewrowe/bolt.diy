ARG BASE=node:20.18.0
FROM ${BASE} AS base
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Add Remix and related dependencies
RUN pnpm add @remix-run/node @remix-run/react @remix-run/server-runtime react react-dom && \
    pnpm add -D @remix-run/dev @types/react @types/react-dom typescript vite unocss \
    vite-plugin-node-polyfills vite-plugin-optimize-css-modules vite-tsconfig-paths

# Production image
FROM base AS bolt-ai-production

# Define environment variables
ENV PORT=8080 \
    NODE_ENV=production

# Create data directory and set permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/data

# Build the Remix application
RUN pnpm run build

# Switch to non-root user
USER node

# Start the server
CMD ["node", "server.js"]
