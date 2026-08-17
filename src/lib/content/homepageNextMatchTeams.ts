import * as Sentry from '@sentry/nextjs';
import { groq } from 'next-sanity';
import logger from '@/lib/logger';
import { client } from '@/sanity/lib/client';

const log = logger.child({ module: 'homepage-next-match-teams' });
const maxHomepageNextMatchTeams = 2;

export const homepageNextMatchTeamsQuery = groq`
  *[_type == "team" && showNextMatchOnHomepage == true] {
    "slug": slug.current,
    "displayName": coalesce(homepageDisplayName, name),
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

/** Teams featured in the homepage next-match countdown — capped at 2 in the query itself
 * (lowest 2 by homepageNextMatchOrder win if more are enabled in Studio, falling back to the
 * general Order field if that's not set — see team.ts), so the caller never has to enforce
 * the limit. */
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
