import { splitPersonName } from '@/lib/transformers/personTransformer';
import type { Player } from '@/types/team';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
	players: Player[];
}

type AreaOfPitch = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

const positionLabels: Record<AreaOfPitch, string> = {
	goalkeeper: 'Goalkeepers',
	defender: 'Defenders',
	midfielder: 'Midfielders',
	forward: 'Forwards'
};

const positionOrder: AreaOfPitch[] = ['goalkeeper', 'defender', 'midfielder', 'forward'];

export function PlayerGrid({ players }: PlayerGridProps) {
	const playersByPosition = players.reduce(
		(acc, player) => {
			const area = player.areaOfPitch;
			if (area && positionOrder.includes(area as AreaOfPitch)) {
				if (!acc[area]) {
					acc[area] = [];
				}
				acc[area].push(player);
			}
			return acc;
		},
		{} as Record<string, Player[]>
	);

	positionOrder.forEach((position) => {
		if (playersByPosition[position]) {
			playersByPosition[position].sort((a, b) => (a.shirtNumber || 0) - (b.shirtNumber || 0));
		}
	});

	return (
		<div className="space-y-16">
			{positionOrder.map((position) => {
				const positionPlayers = playersByPosition[position];
				if (!positionPlayers || positionPlayers.length === 0) {
					return null;
				}

				return (
					<section key={position} className="space-y-8">
						<h2 className="text-3xl font-black uppercase">{positionLabels[position]}</h2>
						<div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{positionPlayers.map((player) => {
								const { firstName, lastName } = splitPersonName(player.person.name);
								return (
									<PlayerCard
										key={player.person._id}
										firstName={firstName}
										lastName={lastName}
										shirtNumber={player.shirtNumber || 0}
										position={player.position || ''}
										photoUrl={player.person?.photo?.asset?.url ?? '/img/player-alt.webp'}
										photoAlt={player.person?.photo?.alt || player.person.name}
										isCaptain={player.isCaptain || false}
										isViceCaptain={player.isViceCaptain || false}
										intro={player.intro}
									/>
								);
							})}
						</div>
					</section>
				);
			})}
		</div>
	);
}
