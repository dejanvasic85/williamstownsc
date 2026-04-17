type Props = { name: string; className?: string };

export function TeamPhotoPlaceholder({ name, className }: Props) {
	return (
		<figure
			className={
				className ??
				'bg-primary relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl md:h-64'
			}
		>
			<span className="text-accent/90 text-5xl font-black tracking-widest uppercase select-none">
				{abbreviate(name)}
			</span>
		</figure>
	);
}

function abbreviate(name: string): string {
	const words = name.split(' ');
	const underIdx = words.findIndex((w) => w.toLowerCase() === 'under');
	if (underIdx !== -1) {
		const prefix = words
			.slice(0, underIdx)
			.map((w) => w[0].toUpperCase())
			.join('');
		const suffix = words.slice(underIdx + 1).join('');
		return prefix ? `${prefix} U${suffix}` : `U${suffix}`;
	}
	return words
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 4);
}
