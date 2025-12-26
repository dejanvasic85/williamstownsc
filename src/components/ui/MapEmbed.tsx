type MapEmbedProps = {
	src: string;
	title?: string;
};

function isValidMapUrl(url: string): boolean {
	try {
		const urlObj = new URL(url);
		return (
			urlObj.protocol === 'https:' &&
			(urlObj.hostname.includes('google.com') || urlObj.hostname.includes('maps.google.com'))
		);
	} catch {
		return false;
	}
}

export function MapEmbed({ src, title = 'Location map' }: MapEmbedProps) {
	if (!isValidMapUrl(src)) {
		return null;
	}

	return (
		<div className="relative aspect-video w-full overflow-hidden rounded-lg">
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
