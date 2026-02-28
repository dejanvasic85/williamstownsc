import Image from 'next/image';

interface CoachCardProps {
	firstName: string;
	lastName: string;
	role: string;
	photoUrl: string;
	photoAlt: string;
}

export function CoachCard({ firstName, lastName, role, photoUrl, photoAlt }: CoachCardProps) {
	return (
		<div className="text-base-content bg-surface relative mx-auto w-full max-w-64 overflow-hidden rounded-xl transition-shadow hover:shadow-xl">
			<div className="relative aspect-square">
				<Image src={photoUrl} alt={photoAlt} fill className="object-cover" sizes="256px" />
			</div>

			<div className="space-y-1 p-4">
				<div className="text-sm font-medium text-(--color-base-content-secondary) uppercase">
					{firstName}
				</div>
				<div className="text-2xl leading-tight font-black uppercase">{lastName}</div>
				<div className="text-sm text-(--color-base-content-secondary)">{role}</div>
			</div>
		</div>
	);
}
