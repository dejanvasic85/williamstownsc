import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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

export default nextConfig;
