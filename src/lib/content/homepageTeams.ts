import type { PortableTextBlock } from '@portabletext/types';
import * as Sentry from '@sentry/nextjs';
import { groq } from 'next-sanity';
import logger from '@/lib/logger';
import { getSanityClient } from '@/sanity/lib/client';
import type { Tenant } from '@/tenants/schema/tenantSchema';

const log = logger.child({ module: 'homepage-teams' });

export const homepageTeamsQuery = groq`
  *[_type == "team" && showOnHomepage == true] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    photo {
      asset-> {
        _ref,
        url
      },
      alt
    },
    description
  }
`;

export type HomepageTeam = {
	_id: string;
	name: string;
	slug: string;
	photo?: {
		asset: {
			_ref: string;
			url: string;
		};
		alt?: string;
	};
	description: PortableTextBlock[];
};

/** Teams shown in the homepage football section. Returns an empty list on failure. */
export async function getHomepageTeams(tenant: Tenant): Promise<HomepageTeam[]> {
	try {
		return await getSanityClient(tenant).fetch<HomepageTeam[]>(
			homepageTeamsQuery,
			{},
			{ next: { tags: ['team'] } }
		);
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'error fetching homepage teams');
		return [];
	}
}
