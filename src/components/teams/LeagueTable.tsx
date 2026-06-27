import Image from 'next/image';
import { getClubConfig } from '@/lib/config';
import type { TableEntry } from '@/types/table';

type LeagueTableProps = {
	entries: TableEntry[];
};

type Column = {
	label: string;
	shortLabel: string;
	key: keyof TableEntry;
};

const columns: Column[] = [
	{ label: 'Played', shortLabel: 'P', key: 'played' },
	{ label: 'Goal Difference', shortLabel: 'GD', key: 'goalDifference' },
	{ label: 'Points', shortLabel: 'Pts', key: 'points' }
];

function buildDuplicateClubNames(entries: TableEntry[]): Set<string> {
	const counts = new Map<string, number>();
	for (const entry of entries) {
		counts.set(entry.clubName, (counts.get(entry.clubName) ?? 0) + 1);
	}
	return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name));
}

function resolveEntryDisplayName(entry: TableEntry, duplicateClubNames: Set<string>): string {
	return duplicateClubNames.has(entry.clubName) ? entry.teamName : entry.clubName;
}

export function LeagueTable({ entries }: LeagueTableProps) {
	const { wscClubDriblName } = getClubConfig();
	const duplicateClubNames = buildDuplicateClubNames(entries);

	return (
		<div className="w-full overflow-hidden">
			<table className="table-zebra table w-full text-sm">
				<thead>
					<tr>
						<th className="w-6 px-1 text-center">#</th>
						<th className="min-w-0">Team</th>
						{columns.map((col) => (
							<th key={col.key} className="w-10 px-1 text-center">
								<span className="sr-only">{col.label}</span>
								<span aria-hidden="true">{col.shortLabel}</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{entries.map((entry) => {
						const isWsc = entry.clubName.includes(wscClubDriblName);
						return (
							<tr
								key={entry.teamId}
								className={isWsc ? 'bg-secondary/10 font-semibold' : undefined}
							>
								<td className="px-1 text-center tabular-nums">{entry.position}</td>
								<td className="max-w-0 min-w-0">
									<div className="flex items-center gap-2">
										<Image
											src={entry.logoUrl}
											alt={entry.clubName}
											width={24}
											height={24}
											className="shrink-0 rounded-full object-contain"
											unoptimized
										/>
										<span className="truncate">
											{resolveEntryDisplayName(entry, duplicateClubNames)}
										</span>
									</div>
								</td>
								{columns.map((col) => (
									<td key={col.key} className="px-1 text-center tabular-nums">
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
