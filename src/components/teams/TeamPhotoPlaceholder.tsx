type Props = { name: string; className?: string };

export function TeamPhotoPlaceholder({ name, className }: Props) {
	return (
		<figure
			className={
				className ??
				'bg-primary/10 relative flex aspect-video items-center justify-center overflow-hidden'
			}
		>
			<span className="text-primary/40 text-5xl font-black tracking-widest uppercase select-none">
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
