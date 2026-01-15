import type { EnrichedFixture } from '@/types/matches';
import { MatchCardDesktop } from './MatchCardDesktop';
import { MatchCardMobile } from './MatchCardMobile';

type MatchCardProps = {
	fixture: EnrichedFixture;
};

function formatMatchDate(dateStr: string): string {
	const date = new Date(dateStr);
	const dayOfMonth = date.getDate();
	const month = date.toLocaleDateString('en-AU', { month: 'short' });
	const day = date.toLocaleDateString('en-AU', { weekday: 'short' });
	return `${day} ${dayOfMonth} ${month}`;
}

function formatMatchTime(time: string): string {
	return time.replace(/\s+(AM|PM)/i, '$1');
}

export function MatchCard({ fixture }: MatchCardProps) {
	const formattedDate = formatMatchDate(fixture.date);
	const formattedTime = formatMatchTime(fixture.time);

	return (
		<li className="border-base-200 list-row grid-cols-1 border-b px-0 py-4 last:border-b-0">
			{/* Mobile */}
			<div className="md:hidden">
				<MatchCardMobile
					fixture={fixture}
					formattedDate={formattedDate}
					formattedTime={formattedTime}
				/>
			</div>

			{/* Desktop */}
			<div className="hidden md:block">
				<MatchCardDesktop
					fixture={fixture}
					formattedDate={formattedDate}
					formattedTime={formattedTime}
				/>
			</div>
		</li>
	);
}
