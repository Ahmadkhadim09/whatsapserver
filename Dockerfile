# Official Puppeteer image — Chrome is already installed, no download step needed
FROM ghcr.io/puppeteer/puppeteer:23.11.1

# The puppeteer image runs as a non-root user by default; switch to root briefly to install deps
USER root

WORKDIR /app

# Prevent npm install from trying to download its own Chromium —
# the base image already has Chrome installed.
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
RUN npm install

COPY . .

# Puppeteer image already has PUPPETEER_SKIP_DOWNLOAD set and Chrome installed at a known path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Give the non-root user ownership of the app directory so it can create the session folder
RUN mkdir -p /app/session && chown -R pptruser:pptruser /app

# Switch back to the non-root user provided by the base image for safety
USER pptruser

EXPOSE 3000

CMD ["node", "server.js"]
