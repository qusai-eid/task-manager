# Build context = the backend/ directory (Railway Root Directory = "backend").
# Node 24: node:sqlite is stable here (flag-free). Node 22 crashes on it.
FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Production ─────────────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN mkdir -p data/uploads

ENV NODE_ENV=production
CMD ["node", "dist/app.js"]
