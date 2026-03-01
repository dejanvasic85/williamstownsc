type AspectRatio = 'video' | '4/3' | 'square';

const aspectClassValue: Record<AspectRatio, string> = {
	video: 'aspect-video',
	'4/3': 'aspect-[4/3]',
	square: 'aspect-square'
};

type MapEmbedProps = {
	src: string;
	title?: string;
	aspectRatio?: AspectRatio;
};

function isValidMapUrl(url: string): boolean {
	try {
		const urlObj = new URL(url);
		const hostname = urlObj.hostname.toLowerCase();
		const pathname = urlObj.pathname.toLowerCase();

		const isValidGoogleDomain =
			hostname === 'google.com' ||
			hostname === 'www.google.com' ||
			hostname === 'maps.google.com' ||
			hostname.endsWith('.google.com');

		const isValidPath = pathname.startsWith('/maps');

		return urlObj.protocol === 'https:' && isValidGoogleDomain && isValidPath;
	} catch {
		return false;
	}
}

export function MapEmbed({ src, title = 'Location map', aspectRatio = 'video' }: MapEmbedProps) {
	if (!isValidMapUrl(src)) {
		return null;
	}

	return (
		<div className={`relative ${aspectClassValue[aspectRatio]} w-full overflow-hidden rounded-lg`}>
			<iframe
				src={src}
				title={title}
				className="absolute inset-0 h-full w-full border-0"
				allowFullScreen
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
				sandbox="allow-scripts allow-same-origin"
			/>
		</div>
	);
}
