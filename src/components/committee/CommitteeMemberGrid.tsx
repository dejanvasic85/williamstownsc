import { splitPersonName } from '@/lib/transformers/personTransformer';
import type { CommitteeMember } from '@/types/committee';
import { CommitteeMemberCard } from './CommitteeMemberCard';

type CommitteeMemberGridProps = {
	members: CommitteeMember[];
};

export function CommitteeMemberGrid({ members }: CommitteeMemberGridProps) {
	const sortedMembers = [...members].sort((a, b) => (a.order || 0) - (b.order || 0));

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{sortedMembers.map((member) => {
				const { firstName, lastName } = splitPersonName(member.person.name);
				return (
					<CommitteeMemberCard
						key={member.person._id}
						firstName={firstName}
						lastName={lastName}
						title={member.title}
						photoUrl={member.person.photo.asset.url}
						photoAlt={member.person.photo.alt || member.person.name}
					/>
				);
			})}
		</div>
	);
}
