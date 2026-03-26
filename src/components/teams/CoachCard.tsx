import { PersonCard } from '@/components/PersonCard';

type CoachCardProps = {
	firstName: string;
	lastName: string;
	role: string;
	photoUrl: string;
	photoAlt: string;
};

export function CoachCard({ firstName, lastName, role, photoUrl, photoAlt }: CoachCardProps) {
	return (
		<PersonCard photoUrl={photoUrl} photoAlt={photoAlt}>
			<div className="space-y-1 p-4">
				<div className="text-sm font-medium text-(--color-base-content-secondary) uppercase">
					{firstName}
				</div>
				<div className="truncate text-2xl leading-tight font-black uppercase">{lastName}</div>
				<div className="text-sm text-(--color-base-content-secondary)">{role}</div>
			</div>
		</PersonCard>
	);
}
