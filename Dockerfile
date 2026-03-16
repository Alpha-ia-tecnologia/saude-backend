FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Run migrations (best-effort), seed (best-effort), then start
CMD ["sh", "-c", "npx prisma migrate deploy || true; npx prisma db seed || true; npm start"]
