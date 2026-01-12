import clubsData from '@data/clubs/clubs.json';
import { type Club, type Clubs, type ExternalClub, clubSchema, clubsSchema } from '@/types/matches';

const clubs: Clubs = clubsSchema.parse(clubsData);

function normalizeTeamName(teamName: string): string {
	return teamName.replace(/\s+Seniors\s*$/, '').trim();
}

export function getClubs(): Club[] {
	return clubs.clubs;
}

export function getClubByExternalId(externalId: string): Club | undefined {
	return getClubs().find((club) => club.externalId === externalId);
}

export function findClubByLogoUrl(logoUrl: string): string | null {
	const club = getClubs().find((c) => c.logoUrl === logoUrl);
	return club?.externalId || null;
}

export function findClubByName(teamName: string): string | null {
	const cleanName = normalizeTeamName(teamName);

	const club = getClubs().find((c) => {
		const clubCleanName = c.name.trim();
		const clubDisplayCleanName = normalizeTeamName(c.displayName);

		return clubCleanName === cleanName || clubDisplayCleanName === cleanName;
	});

	return club?.externalId || null;
}

export function findClubExternalId(teamName: string, logoUrl: string): string {
	const byLogo = findClubByLogoUrl(logoUrl);
	if (byLogo) {
		return byLogo;
	}

	const byName = findClubByName(teamName);
	if (byName) {
		return byName;
	}

	throw new Error(`Could not find club for team: ${teamName} (logo: ${logoUrl})`);
}

export function transformExternalClub(externalClub: ExternalClub): Club {
	const { id: externalId, attributes } = externalClub;

	const street =
		[attributes.address?.address_line_1, attributes.address?.address_line_2]
			.filter(Boolean)
			.join(' ') || undefined;

	const address =
		street && attributes.address?.city && attributes.address?.state && attributes.address?.postcode
			? {
					street,
					city: attributes.address.city,
					state: attributes.address.state,
					postcode: attributes.address.postcode
				}
			: undefined;

	const socials = attributes.socials
		?.map((social) => ({
			platform: social.name,
			url: social.value
		}))
		.filter((social) => social.platform && social.url);

	const club: Club = {
		externalId,
		name: attributes.name,
		displayName: attributes.name,
		logoUrl: attributes.image,
		email: attributes.email || undefined,
		phone: attributes.phone || undefined,
		website: attributes.url || undefined,
		address,
		socials: socials && socials.length > 0 ? socials : undefined
	};

	return clubSchema.parse(club);
}
