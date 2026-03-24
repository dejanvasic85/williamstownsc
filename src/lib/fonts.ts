import localFont from 'next/font/local';

export const outfit = localFont({
	variable: '--font-outfit',
	src: [
		{
			path: '../../node_modules/@fontsource/outfit/files/outfit-latin-400-normal.woff2',
			weight: '400'
		},
		{
			path: '../../node_modules/@fontsource/outfit/files/outfit-latin-500-normal.woff2',
			weight: '500'
		},
		{
			path: '../../node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff2',
			weight: '600'
		},
		{
			path: '../../node_modules/@fontsource/outfit/files/outfit-latin-700-normal.woff2',
			weight: '700'
		},
		{
			path: '../../node_modules/@fontsource/outfit/files/outfit-latin-800-normal.woff2',
			weight: '800'
		}
	]
});

export const exo = localFont({
	variable: '--font-exo',
	src: [
		{
			path: '../../node_modules/@fontsource/exo/files/exo-latin-400-normal.woff2',
			weight: '400'
		},
		{
			path: '../../node_modules/@fontsource/exo/files/exo-latin-500-normal.woff2',
			weight: '500'
		},
		{
			path: '../../node_modules/@fontsource/exo/files/exo-latin-600-normal.woff2',
			weight: '600'
		},
		{
			path: '../../node_modules/@fontsource/exo/files/exo-latin-700-normal.woff2',
			weight: '700'
		},
		{
			path: '../../node_modules/@fontsource/exo/files/exo-latin-800-normal.woff2',
			weight: '800'
		}
	]
});
