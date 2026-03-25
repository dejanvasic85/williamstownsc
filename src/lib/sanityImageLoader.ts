'use client';

import type { ImageLoaderProps } from 'next/image';

export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
	const url = new URL(src);
	url.searchParams.set('w', width.toString());
	url.searchParams.set('q', (quality || 75).toString());
	url.searchParams.set('auto', 'format');
	return url.toString();
}
