FROM node:22-alpine
# Alpine-based image minimizes attack surface, reducing security vulnerabilities and image size
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy source code and built dist
COPY . .

# Build TypeScript
RUN npm run build

# Expose port as per specification
EXPOSE 5477

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5477/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run the application
CMD ["node", "dist/index.js"]
