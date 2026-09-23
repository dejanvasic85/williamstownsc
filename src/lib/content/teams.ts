import * as Sentry from '@sentry/nextjs';
import { groq } from 'next-sanity';
import logger from '@/lib/logger';
import { getSanityClient } from '@/sanity/lib/client';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import type { TeamBase } from '@/types/team';

const log = logger.child({ module: 'teams-content' });

export const teamsDirectoryQuery = groq`
  *[_type == "team"] | order(ageGroup asc, order asc) {
    _id,
    name,
    "slug": slug.current,
    ageGroup,
    gender,
    order
  }
`;

export const teamsQuery = groq`
  *[_type == "team"] | order(ageGroup asc, order asc) {
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
    gender,
    ageGroup,
    order,
    description,
    coachingStaff[] {
      person-> {
        _id,
        name,
        photo {
          asset-> {
            _ref,
            url
          },
          alt
        },
        dateOfBirth
      },
      title
    },
    players[] {
      person-> {
        _id,
        name,
        photo {
          asset-> {
            _ref,
            url
          },
          alt
        },
        dateOfBirth
      },
      shirtNumber,
      position,
      areaOfPitch,
      isCaptain,
      isViceCaptain
    },
    fixturesUrl
  }
`;

/** The team directory. Returns an empty list on failure so the page still renders. */
export async function getTeamsDirectory(tenant: Tenant): Promise<TeamBase[]> {
	try {
		return await getSanityClient(tenant).fetch<TeamBase[]>(
			teamsDirectoryQuery,
			{},
			{ next: { tags: ['team'] } }
		);
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'error fetching teams');
		return [];
	}
}

export async function getAllTeamsForSitemap(tenant: Tenant) {
	const allTeamsQuery = groq`
		*[_type == "team"] {
			"slug": slug.current
		}
	`;

	const teams = await getSanityClient(tenant).fetch<Array<{ slug: string }>>(
		allTeamsQuery,
		{},
		{ next: { tags: ['team'] } }
	);

	return teams
		.filter((team) => team.slug)
		.map((team) => ({
			slug: team.slug
		}));
}
