FROM node:24-bookworm-slim AS build

ARG PNPM_VERSION=11.25.0

ENV HUSKY=0

RUN npm install --global "pnpm@${PNPM_VERSION}"

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api

RUN pnpm --filter @ticketflow/api build \
    && pnpm --filter @ticketflow/api deploy \
        --prod --legacy /out/api

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=build --chown=node:node /out/api/ ./

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
