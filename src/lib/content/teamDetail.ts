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
