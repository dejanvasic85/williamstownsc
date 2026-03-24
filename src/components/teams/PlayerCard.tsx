import type { PortableTextBlock } from '@portabletext/types';
import clsx from 'clsx';
import { PersonCard } from '@/components/PersonCard';

type PlayerCardProps = {
	firstName: string;
	lastName: string;
	shirtNumber: number;
	position: string;
	photoUrl: string;
	photoAlt: string;
	isCaptain?: boolean;
	isViceCaptain?: boolean;
	intro?: PortableTextBlock[];
};

function extractIntroText(intro?: PortableTextBlock[]): string | null {
	if (!intro || intro.length === 0) return null;

	return intro
		.map((block) => {
			if (block._type === 'block' && block.children) {
				return block.children.map((child) => child.text).join('');
			}
			return '';
		})
		.join(' ');
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
	const introText = extractIntroText(intro);
	const secondaryTextClass = isCaptain
		? 'text-primary-content opacity-70'
		: 'text-(--color-base-content-secondary)';

	return (
		<PersonCard
			photoUrl={photoUrl}
			photoAlt={photoAlt}
			variant={isCaptain ? 'highlighted' : 'standard'}
		>
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
						<div className={clsx('text-sm', secondaryTextClass)}>{position}</div>
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
					<p className={clsx('text-sm leading-relaxed', secondaryTextClass)}>{introText}</p>
				)}
			</div>
		</PersonCard>
	);
}
