FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

USER root

ARG PNPM_VERSION=11.25.0
RUN npm install --global pnpm@${PNPM_VERSION}

RUN curl -fsSL https://artifacts-cli.infisical.com/setup.deb.sh \
      -o /tmp/infisical-setup.sh \
    && bash /tmp/infisical-setup.sh \
    && apt-get update \
    && apt-get install -y --no-install-recommends infisical \
    && rm -f /tmp/infisical-setup.sh \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/ticketflow

USER node
