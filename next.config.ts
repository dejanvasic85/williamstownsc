import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
	serverExternalPackages: ['pino', 'pino-pretty'],
	images: {
		qualities: [75, 90],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.sanity.io',
				port: '',
				pathname: '/**'
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/**'
			},
			{
				protocol: 'https',
				hostname: 'ocean.dribl.com',
				port: '',
				pathname: '/**'
			}
		]
	}
};

export default withSentryConfig(nextConfig, {
	org: 'vasic-org',
	project: 'javascript-nextjs',
	silent: !process.env.CI,
	widenClientFileUpload: true,
	sourcemaps: { deleteSourcemapsAfterUpload: true },
	webpack: {
		reactComponentAnnotation: { enabled: true },
		treeshake: {
			removeDebugLogging: true
		}
	}
});
