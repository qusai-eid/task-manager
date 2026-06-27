# ── Build stage ────────────────────────────────────────────────────
# Node 24: node:sqlite is stable here (no --experimental flag needed).
# Node 22 made it experimental/flag-gated, which crashed the app on Railway.
FROM node:24-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
RUN npm run build

# ── Production stage ───────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# SQLite database + uploaded files live here
RUN mkdir -p data/uploads

ENV NODE_ENV=production

CMD ["node", "dist/app.js"]
