FROM node:24.12.0-bookworm

# Chrome and all Playwright browser binaries live here (baked into the image)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install Chrome + all system dependencies via Playwright CLI
# Pin to the exact version used by the project
RUN npx --yes playwright@1.59.1 install --with-deps chrome

# Install xvfb for virtual display (crawlers run with headless: false)
RUN apt-get update && apt-get install -y --no-install-recommends xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
