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
	mobileHidden?: boolean;
};

const columns: Column[] = [
	{ label: 'Played', shortLabel: 'P', key: 'played' },
	{ label: 'Won', shortLabel: 'W', key: 'wins', mobileHidden: true },
	{ label: 'Drawn', shortLabel: 'D', key: 'draws', mobileHidden: true },
	{ label: 'Lost', shortLabel: 'L', key: 'losses', mobileHidden: true },
	{ label: 'Goals For', shortLabel: 'GF', key: 'goalsFor', mobileHidden: true },
	{ label: 'Goals Against', shortLabel: 'GA', key: 'goalsAgainst', mobileHidden: true },
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

const maxNameLength = 30;
const backChars = 10;

function truncateMiddle(text: string): string {
	if (text.length <= maxNameLength) return text;
	return `${text.slice(0, maxNameLength - backChars - 3)}...${text.slice(-backChars)}`;
}

export function LeagueTable({ entries }: LeagueTableProps) {
	const { wscClubDriblName } = getClubConfig();
	const duplicateClubNames = buildDuplicateClubNames(entries);

	return (
		<div className="overflow-hidden md:overflow-x-auto">
			<table className="table-zebra table w-full text-sm">
				<thead>
					<tr>
						<th className="w-6 px-1 text-center md:w-8 md:px-4">#</th>
						<th className="min-w-0 md:min-w-fit">Team</th>
						{columns.map((col) => (
							<th
								key={col.key}
								className={[
									'w-10 px-1 text-center md:w-auto md:px-4',
									col.mobileHidden ? 'hidden md:table-cell' : ''
								].join(' ')}
							>
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
								<td className="px-1 text-center tabular-nums md:px-4">{entry.position}</td>
								<td className="max-w-0 min-w-0 md:max-w-64">
									<div className="flex items-center gap-2">
										<Image
											src={entry.logoUrl}
											alt={entry.clubName}
											width={24}
											height={24}
											className="shrink-0 rounded-full object-contain"
											unoptimized
										/>
										<span
											className="truncate"
											title={resolveEntryDisplayName(entry, duplicateClubNames)}
										>
											{truncateMiddle(resolveEntryDisplayName(entry, duplicateClubNames))}
										</span>
									</div>
								</td>
								{columns.map((col) => (
									<td
										key={col.key}
										className={[
											'px-1 text-center tabular-nums md:px-4',
											col.mobileHidden ? 'hidden md:table-cell' : ''
										].join(' ')}
									>
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
