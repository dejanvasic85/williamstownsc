import Image from 'next/image';
import type { Coach } from '@/types/team';

interface CoachingStaffAvatarsProps {
	coaches: Coach[];
}

const coachTitleLabels: Record<string, string> = {
	'Head Coach': 'Head Coach',
	'Assistant Coach': 'Assistant Coach',
	'Goalkeeper Coach': 'Goalkeeper Coach',
	'Team Manager': 'Team Manager',
	Physio: 'Physio'
};

export function CoachingStaffAvatars({ coaches }: CoachingStaffAvatarsProps) {
	if (coaches.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<h4 className="text-base-content/80 text-sm font-bold tracking-wide uppercase">
				Coaching Staff
			</h4>
			<div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:gap-6">
				{coaches.map((coach) => (
					<div key={coach.person._id} className="flex items-center gap-4">
						<div className="avatar">
							<div className="h-12 w-12 rounded-full">
								<Image
									src={coach.person.photo.asset.url}
									alt={coach.person.photo.alt || coach.person.name}
									width={48}
									height={48}
									className="object-cover"
								/>
							</div>
						</div>
						<div className="flex flex-col">
							<span className="text-base-content font-semibold">{coach.person.name}</span>
							<span className="text-base-content/60 text-sm">
								{coachTitleLabels[coach.title] || coach.title}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
