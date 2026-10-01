# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS workspace
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates git && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @techenglish/api db:generate

FROM workspace AS api
RUN pnpm --filter @techenglish/api build
RUN cp apps/api/prisma/schema.prisma docker/prisma/schema.prisma && chown -R node:node docker/prisma
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
WORKDIR /app/apps/api
USER node
EXPOSE 8080
CMD ["node", "dist/src/main.js"]

FROM workspace AS web
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web build
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
RUN chown -R node:node /app/apps/web/.next
WORKDIR /app/apps/web
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]

FROM workspace AS mobile
ENV EXPO_NO_TELEMETRY=1
RUN mkdir -p /app/apps/mobile/.expo && chown -R node:node /app/apps/mobile
WORKDIR /app/apps/mobile
USER node
EXPOSE 8081
CMD ["node", "node_modules/expo/bin/cli", "start", "--lan", "--port", "8081"]
