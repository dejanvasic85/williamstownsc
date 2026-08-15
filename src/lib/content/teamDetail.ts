import { cache } from 'react';
import * as Sentry from '@sentry/nextjs';
import { groq } from 'next-sanity';
import logger from '@/lib/logger';
import { client } from '@/sanity/lib/client';
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
      alt
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

export async function getTeamBySlug(slug: string): Promise<Team | null> {
	try {
		return await client.fetch<Team>(teamDetailQuery, { slug }, { next: { tags: ['team'] } });
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, slug }, 'error fetching team');
		return null;
	}
}

const teamLeagueIdQuery = groq`
  *[_type == "team" && slug.current == $slug][0].matchday.leagueId
`;

/**
 * Cheap standalone lookup for callers that only need the matchday leagueId (not the full team
 * document) to decide whether to read fixtures/table from the matchday API or local JSON.
 * `cache()`-wrapped so the several call sites that need this per request (matches/table
 * services, calendar route) share one query.
 */
export const getTeamLeagueId = cache(async function getTeamLeagueId(
	slug: string
): Promise<string | null> {
	try {
		const leagueId = await client.fetch<string | null>(
			teamLeagueIdQuery,
			{ slug },
			{ next: { tags: ['team'] } }
		);
		return leagueId ?? null;
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, slug }, 'error fetching team leagueId');
		return null;
	}
});
