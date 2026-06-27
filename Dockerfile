# ── Build stage ────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cache friendly)
COPY backend/package*.json ./
RUN npm ci

# Copy source and compile TypeScript
COPY backend/ .
RUN npm run build

# ── Production stage ───────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Only production deps
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Compiled output from builder
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite + uploads
RUN mkdir -p data/uploads

EXPOSE 5000

CMD ["node", "dist/app.js"]
