type MapEmbedProps = {
	src: string;
	title?: string;
};

export function MapEmbed({ src, title = 'Location map' }: MapEmbedProps) {
	return (
		<div className="relative aspect-video w-full overflow-hidden rounded-lg">
			<iframe
				src={src}
				title={title}
				className="absolute inset-0 h-full w-full border-0"
				allowFullScreen
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
			/>
		</div>
	);
}
