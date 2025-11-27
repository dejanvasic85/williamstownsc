import type { PortableTextBlock } from '@portabletext/types';
import Image from 'next/image';

interface PlayerCardProps {
	firstName: string;
	lastName: string;
	shirtNumber: number;
	position: string;
	photoUrl: string;
	photoAlt: string;
	isCaptain?: boolean;
	isViceCaptain?: boolean;
	intro?: PortableTextBlock[];
}

export function PlayerCard({
	firstName,
	lastName,
	shirtNumber,
	position,
	photoUrl,
	photoAlt,
	isCaptain = false,
	isViceCaptain = false,
	intro
}: PlayerCardProps) {
	const containerClass = isCaptain
		? 'bg-primary text-primary-content'
		: 'bg-white text-base-content';

	const introText =
		intro && intro.length > 0
			? intro
					.map((block) => {
						if (block._type === 'block' && block.children) {
							return block.children.map((child) => child.text).join('');
						}
						return '';
					})
					.join(' ')
			: null;

	return (
		<div
			className={`relative overflow-hidden rounded-3xl ${containerClass} transition-shadow hover:shadow-xl`}
		>
			<div className="relative aspect-[4/3] md:aspect-[3/4]">
				<Image src={photoUrl} alt={photoAlt} fill className="object-cover" sizes="300px" />
			</div>

			<div className="space-y-3 p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex-1 space-y-1">
						<div className="text-sm font-medium uppercase opacity-80">{firstName}</div>
						<div className="text-2xl leading-tight font-black uppercase">{lastName}</div>
						<div className="text-sm opacity-70">{position}</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						{isCaptain && (
							<div className="bg-primary-content text-primary rounded px-3 py-1 text-xs font-bold tracking-wide uppercase">
								Captain
							</div>
						)}
						{isViceCaptain && !isCaptain && (
							<div className="bg-base-100 text-base-content rounded px-3 py-1 text-xs font-bold tracking-wide uppercase">
								Vice Captain
							</div>
						)}
						<div className="text-5xl font-black opacity-20">{shirtNumber}</div>
					</div>
				</div>
				{introText && <p className="text-sm leading-relaxed opacity-70">{introText}</p>}
			</div>
		</div>
	);
}
