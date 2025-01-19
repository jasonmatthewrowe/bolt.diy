ARG BASE=node:20.18.0
FROM ${BASE} AS base
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copy the rest of your app's source code
COPY . .

# Production image
FROM base AS bolt-ai-production

# Define environment variables
ARG VITE_LOG_LEVEL=debug
ENV PORT=8080 \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} \
    RUNNING_IN_DOCKER=true

# Build the application
RUN pnpm run build

# Create data directory and set permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/data

# Switch to non-root user
USER node

# Start the server
CMD ["node", "server.js"]
