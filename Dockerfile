# Multi-Stage Build fuer Hygieneschulung KjG.
# Stage 1: Frontend mit Vite bauen.
# Stage 2: Backend-Abhaengigkeiten + Sources + Frontend-Statics zusammenfuehren.
# Stage 3: Minimales Runtime-Image.

# ---------- Stage 1: Frontend-Build ----------
FROM node:20-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: Backend-Build + Questions-Export ----------
FROM node:20-alpine AS backend-build
WORKDIR /build/backend

# better-sqlite3 braucht zur Compile-Zeit make/g++/python.
RUN apk add --no-cache python3 make g++

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY backend/ ./
COPY --from=frontend-build /build/frontend/dist ./public

# Generate questions.json aus der Frontend-Quelle, damit das Runtime-Image
# nicht auf das Frontend-Quellverzeichnis angewiesen ist.
COPY frontend/src/data/questions.ts /tmp/questions.ts
RUN node scripts/export-questions.mjs /tmp/questions.ts ./public/questions.json

# ---------- Stage 3: Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Nur das Noetigste fuer den Runtime.
RUN apk add --no-cache tini

COPY --from=backend-build /build/backend/node_modules ./node_modules
COPY --from=backend-build /build/backend/src ./src
COPY --from=backend-build /build/backend/package.json ./package.json
COPY --from=backend-build /build/backend/tsconfig.json ./tsconfig.json
COPY --from=backend-build /build/backend/public ./public

RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npx", "tsx", "src/server.ts"]
