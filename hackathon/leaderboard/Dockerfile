# Multi-stage build for Node.js application

# Stage 1: Build the client
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Copy client source (before install to avoid platform issues)
COPY client/ ./

# Clean install dependencies for the current platform
RUN rm -rf node_modules package-lock.json
RUN npm install

# Build the client
RUN npm run build

# Stage 2: Build the server
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# Copy server package files
COPY package*.json ./

# Copy server source
COPY server/ ./

# Clean install server dependencies  
RUN rm -rf node_modules package-lock.json
RUN npm install --only=production

# Stage 3: Production image
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeapp -u 1001

# Set working directory
WORKDIR /app

# Copy server dependencies and source
COPY --from=server-builder --chown=nodeapp:nodejs /app/server/node_modules ./node_modules
COPY --from=server-builder --chown=nodeapp:nodejs /app/server ./

# Copy built client assets
COPY --from=client-builder --chown=nodeapp:nodejs /app/client/dist ./public

# Create logs directory
RUN mkdir -p logs && chown nodeapp:nodejs logs

# Create database directory
RUN mkdir -p server/database && chown nodeapp:nodejs server/database

# Switch to non-root user
USER nodeapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]