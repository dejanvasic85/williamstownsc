import * as Sentry from '@sentry/nextjs';
import { groq } from 'next-sanity';
import logger from '@/lib/logger';
import { client } from '@/sanity/lib/client';

const log = logger.child({ module: 'homepage-next-match-teams' });
const maxHomepageNextMatchTeams = 2;

export const homepageNextMatchTeamsQuery = groq`
  *[_type == "team" && showNextMatchOnHomepage == true] {
    "slug": slug.current,
    "displayName": select(homepageDisplayName != null && homepageDisplayName != "" => homepageDisplayName, name),
    "sortOrder": coalesce(homepageNextMatchOrder, order)
  } | order(sortOrder asc) [0...${maxHomepageNextMatchTeams}] {
    slug,
    displayName
  }
`;

export type HomepageNextMatchTeam = {
	slug: string;
	displayName: string;
};

/** Teams for the homepage next-match countdown. Capped at 2 in the query, so callers don't. */
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
