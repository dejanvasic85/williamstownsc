import { PersonCard } from '@/components/PersonCard';

type CommitteeMemberCardProps = {
	firstName: string;
	lastName: string;
	title: string;
	photoUrl: string;
	photoAlt: string;
};

export function CommitteeMemberCard({
	firstName,
	lastName,
	title,
	photoUrl,
	photoAlt
}: CommitteeMemberCardProps) {
	return (
		<PersonCard photoUrl={photoUrl} photoAlt={photoAlt}>
			<div className="space-y-1 p-4">
				<div className="text-sm font-medium uppercase opacity-80">{firstName}</div>
				<div className="text-2xl leading-tight font-black uppercase">{lastName}</div>
				<div className="text-primary text-sm font-bold tracking-wide uppercase">{title}</div>
			</div>
		</PersonCard>
	);
}
