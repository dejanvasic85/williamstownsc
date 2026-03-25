import type { ImageLoaderProps } from 'next/image';

export function sanityImageLoader({ src }: ImageLoaderProps): string {
	return src;
}
