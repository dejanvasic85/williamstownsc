import Image from 'next/image';
import type { PortableTextBlock } from '@portabletext/types';
import clsx from 'clsx';

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
		: 'bg-surface text-base-content';

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
			className={`border-base-300 dark:border-primary relative mx-auto w-full max-w-64 overflow-hidden rounded-xl border ${containerClass} transition-shadow hover:shadow-xl`}
		>
			<div className="relative aspect-square">
				<Image src={photoUrl} alt={photoAlt} fill className="object-cover" sizes="256px" />
			</div>

			<div className="space-y-3 p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex-1 space-y-1">
						<div
							className={clsx(
								'text-sm font-medium uppercase',
								isCaptain
									? 'text-primary-content opacity-80'
									: 'text-(--color-base-content-secondary)'
							)}
						>
							{firstName}
						</div>
						<div className="text-2xl leading-tight font-black uppercase">{lastName}</div>
						<div
							className={clsx(
								'text-sm',
								isCaptain
									? 'text-primary-content opacity-70'
									: 'text-(--color-base-content-secondary)'
							)}
						>
							{position}
						</div>
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
						<div
							className={clsx(
								'text-5xl font-black opacity-50 dark:opacity-100',
								isCaptain ? 'text-secondary' : 'text-primary'
							)}
						>
							{shirtNumber}
						</div>
					</div>
				</div>
				{introText && (
					<p
						className={clsx(
							'text-sm leading-relaxed',
							isCaptain
								? 'text-primary-content opacity-70'
								: 'text-(--color-base-content-secondary)'
						)}
					>
						{introText}
					</p>
				)}
			</div>
		</div>
	);
}
