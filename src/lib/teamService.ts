import type { AgeGroup, TabCategory, Team, TeamsByTab } from '@/types/team';

const juniorAgeGroups: AgeGroup[] = [
	'6',
	'7',
	'8',
	'9',
	'10',
	'11',
	'12',
	'13',
	'14',
	'15',
	'16',
	'17',
	'18'
];

export function getTabCategory(ageGroup: AgeGroup): TabCategory {
	if (ageGroup === 'seniors') return 'seniors';
	if (ageGroup === 'reserves') return 'reserves';
	if (ageGroup === 'metros') return 'metros';
	if (ageGroup === 'masters' || ageGroup === 'over45') return 'masters';
	return 'juniors';
}

export function sortTeams<T extends Team>(teams: T[]): T[] {
	return [...teams].sort((a, b) => {
		const aIsJunior = juniorAgeGroups.includes(a.ageGroup);
		const bIsJunior = juniorAgeGroups.includes(b.ageGroup);

		if (aIsJunior && bIsJunior) {
			const aAge = parseInt(a.ageGroup, 10);
			const bAge = parseInt(b.ageGroup, 10);

			if (aAge !== bAge) {
				return bAge - aAge;
			}
		}

		return a.order - b.order;
	});
}

export function groupTeamsByTab<T extends Team>(teams: T[]): TeamsByTab<T> {
	const grouped: TeamsByTab<T> = {
		seniors: [],
		reserves: [],
		juniors: [],
		masters: [],
		metros: []
	};

	teams.forEach((team) => {
		const category = getTabCategory(team.ageGroup);
		grouped[category].push(team);
	});

	return {
		seniors: sortTeams(grouped.seniors),
		reserves: sortTeams(grouped.reserves),
		juniors: sortTeams(grouped.juniors),
		masters: sortTeams(grouped.masters),
		metros: sortTeams(grouped.metros)
	};
}
