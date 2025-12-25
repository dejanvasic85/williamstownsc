import Image from 'next/image';

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
		<div className="text-base-content relative overflow-hidden rounded-3xl bg-white transition-shadow hover:shadow-xl">
			<div className="relative aspect-4/3 md:aspect-3/4">
				<Image src={photoUrl} alt={photoAlt} fill className="object-cover" sizes="300px" />
			</div>

			<div className="space-y-3 p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex-1 space-y-1">
						<div className="text-sm font-medium uppercase opacity-80">{firstName}</div>
						<div className="text-2xl leading-tight font-black uppercase">{lastName}</div>
						<div className="text-primary text-sm font-bold tracking-wide uppercase">{title}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
