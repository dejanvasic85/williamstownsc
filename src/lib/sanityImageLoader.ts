'use client';

import type { ImageLoaderProps } from 'next/image';

export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
	const url = new URL(src);

	const originalWidth = Number(url.searchParams.get('w'));
	const originalHeight = Number(url.searchParams.get('h'));

	url.searchParams.set('w', width.toString());

	if (originalWidth && originalHeight) {
		const scaledHeight = Math.round((width / originalWidth) * originalHeight);
		url.searchParams.set('h', scaledHeight.toString());
	}

	url.searchParams.set('q', (quality || 75).toString());
	url.searchParams.set('auto', 'format');
	return url.toString();
}
