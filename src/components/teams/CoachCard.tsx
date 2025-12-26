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
		<div className="text-base-content relative overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-xl">
			<div className="relative aspect-4/3 md:aspect-3/4">
				<Image src={photoUrl} alt={photoAlt} fill className="object-cover" sizes="300px" />
			</div>

			<div className="space-y-1 p-4">
				<div className="text-sm font-medium uppercase opacity-80">{firstName}</div>
				<div className="text-2xl leading-tight font-black uppercase">{lastName}</div>
				<div className="text-sm opacity-70">{role}</div>
			</div>
		</div>
	);
}
