# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build SCSS and compile EJS
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install http-server and wget for healthcheck
RUN npm install -g http-server && \
    apk add --no-cache wget

# Copy built files from builder
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start server on all interfaces
CMD ["http-server", "-a", "0.0.0.0", "-p", "3000", "./public"]
