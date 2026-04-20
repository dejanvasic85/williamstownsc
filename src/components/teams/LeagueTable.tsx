import Image from 'next/image';
import type { TableEntry } from '@/types/table';

type LeagueTableProps = {
	entries: TableEntry[];
	wscClubName: string;
};

type Column = {
	label: string;
	shortLabel: string;
	key: keyof TableEntry;
};

const columns: Column[] = [
	{ label: 'Played', shortLabel: 'P', key: 'played' },
	{ label: 'Won', shortLabel: 'W', key: 'wins' },
	{ label: 'Drawn', shortLabel: 'D', key: 'draws' },
	{ label: 'Lost', shortLabel: 'L', key: 'losses' },
	{ label: 'Goals For', shortLabel: 'GF', key: 'goalsFor' },
	{ label: 'Goals Against', shortLabel: 'GA', key: 'goalsAgainst' },
	{ label: 'Goal Difference', shortLabel: 'GD', key: 'goalDifference' },
	{ label: 'Points', shortLabel: 'Pts', key: 'points' }
];

export function LeagueTable({ entries, wscClubName }: LeagueTableProps) {
	return (
		<div className="overflow-x-auto">
			<table className="table-zebra table w-full text-sm">
				<thead>
					<tr>
						<th className="w-8 text-center">#</th>
						<th>Team</th>
						{columns.map((col) => (
							<th key={col.key} className="text-center">
								<span className="sr-only">{col.label}</span>
								<span aria-hidden="true">{col.shortLabel}</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{entries.map((entry) => {
						const isWsc = entry.clubName.includes(wscClubName);
						return (
							<tr
								key={entry.teamId}
								className={isWsc ? 'bg-secondary/10 font-semibold' : undefined}
							>
								<td className="text-center tabular-nums">{entry.position}</td>
								<td>
									<div className="flex items-center gap-2">
										<Image
											src={entry.logoUrl}
											alt={entry.clubName}
											width={24}
											height={24}
											className="shrink-0 rounded-full object-contain"
										/>
										<span className="truncate">{entry.teamName}</span>
									</div>
								</td>
								{columns.map((col) => (
									<td key={col.key} className="text-center tabular-nums">
										{entry[col.key] as number}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
