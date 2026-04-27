FROM --platform=linux/amd64 node:24.12.0-bookworm

# Chrome and all Playwright browser binaries live here (baked into the image)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# Prevent npm ci postinstall from re-downloading browsers at runtime
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install Chrome + all system dependencies via Playwright CLI
# Pin to the exact version used by the project
RUN npx --yes playwright@1.59.1 install --with-deps chrome

# Install xvfb for virtual display (crawlers run with headless: false)
RUN apt-get update && apt-get install -y --no-install-recommends xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
