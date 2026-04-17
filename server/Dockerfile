# Backend Dockerfile for Node.js Express API
FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for potential migration needs)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3456

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3456/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]
