import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		wsc: 'bin/wsc.ts'
	},
	outDir: 'dist/cli',
	platform: 'node',
	format: ['esm'],
	target: 'node20',
	splitting: false,
	sourcemap: true,
	clean: true,
	banner: {
		js: '#!/usr/bin/env node'
	},
	external: [
		'playwright-core',
		'chromium-bidi',
		'chromium-bidi/lib/cjs/bidiMapper/BidiMapper',
		'chromium-bidi/lib/cjs/cdp/CdpConnection'
	]
});
