import * as Sentry from '@sentry/nextjs';
import { groq } from 'next-sanity';
import logger from '@/lib/logger';
import { client } from '@/sanity/lib/client';

const log = logger.child({ module: 'homepage-next-match-teams' });
const maxHomepageNextMatchTeams = 2;

export const homepageNextMatchTeamsQuery = groq`
  *[_type == "team" && showNextMatchOnHomepage == true] | order(order asc) [0...${maxHomepageNextMatchTeams}] {
    "slug": slug.current,
    "displayName": coalesce(homepageDisplayName, name)
  }
`;

export type HomepageNextMatchTeam = {
	slug: string;
	displayName: string;
};

/** Teams featured in the homepage next-match countdown — capped at 2 in the query itself
 * (earliest 2 by `order` win if more are enabled in Studio), so the caller never has to
 * enforce the limit. */
export async function getHomepageNextMatchTeams(): Promise<HomepageNextMatchTeam[]> {
	try {
		return await client.fetch<HomepageNextMatchTeam[]>(
			homepageNextMatchTeamsQuery,
			{},
			{ next: { tags: ['team'] } }
		);
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'error fetching homepage next-match teams');
		return [];
	}
}
