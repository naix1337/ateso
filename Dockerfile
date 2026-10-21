# ATESO Storefront – Self-Hosting-Image (Node statt Oxygen)
# Build:  docker build -t ateso-storefront .
# Start:  docker compose up   (siehe docker-compose.yml)

# --- Build -------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Assets (public/assets) sind eingecheckt; `npm run assets` nur bei neuen Referenzen nötig
RUN npm run build

# --- Runtime -----------------------------------------------------------------
# Der Server-Build ist vollständig gebündelt – keine node_modules nötig
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/package.json ./package.json

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null || exit 1

CMD ["node", "server/node-server.mjs"]
