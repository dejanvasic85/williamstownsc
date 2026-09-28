import { cache } from 'react';
import * as Sentry from '@sentry/nextjs';
import { groq } from 'next-sanity';
import logger from '@/lib/logger';
import { getSanityClient } from '@/sanity/lib/client';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import type { Team } from '@/types/team';

const log = logger.child({ module: 'team-detail' });

export const teamDetailQuery = groq`
  *[_type == "team" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    photo {
      asset-> {
        _ref,
        url
      },
      alt,
      crop,
      hotspot
    },
    gender,
    ageGroup,
    fixturesUrl,
    matchday,
    description,
    coachingStaff[] {
      photo {
        asset-> { _ref, url },
        alt,
        crop,
        hotspot
      },
      person-> {
        _id,
        name,
        photo {
          asset-> {
            _ref,
            url
          },
          alt,
          crop,
          hotspot
        },
        dateOfBirth
      },
      title
    },
    players[] {
      photo {
        asset-> { _ref, url },
        alt,
        crop,
        hotspot
      },
      person-> {
        _id,
        name,
        photo {
          asset-> {
            _ref,
            url
          },
          alt,
          crop,
          hotspot
        },
        dateOfBirth
      },
      shirtNumber,
      position,
      areaOfPitch,
      isCaptain,
      isViceCaptain,
      intro
    }
  }
`;

export async function getTeamBySlug(tenant: Tenant, slug: string): Promise<Team | null> {
	try {
		return await getSanityClient(tenant).fetch<Team>(
			teamDetailQuery,
			{ slug },
			{ next: { tags: ['team'] } }
		);
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, slug }, 'error fetching team');
		return null;
	}
}

const teamLeagueIdQuery = groq`
  *[_type == "team" && slug.current == $slug][0].matchday.leagueId
`;

/** Throws rather than returning null on failure: a Sanity outage must not read as "no leagueId"
 * and silently fall back to a matchday-backed team's stale local JSON. */
export const getTeamLeagueId = cache(async function getTeamLeagueId(
	tenant: Tenant,
	slug: string
): Promise<string | null> {
	const leagueId = await getSanityClient(tenant).fetch<string | null>(
		teamLeagueIdQuery,
		{ slug },
		{ next: { tags: ['team'] } }
	);
	return leagueId ?? null;
});
