type Props = { name: string };

export function TeamPhotoPlaceholder({ name }: Props) {
	return (
		<figure className="bg-primary/10 relative flex aspect-video items-center justify-center overflow-hidden">
			<span className="text-primary/40 text-5xl font-black tracking-widest uppercase select-none">
				{abbreviate(name)}
			</span>
		</figure>
	);
}

function abbreviate(name: string): string {
	return name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 4);
}
