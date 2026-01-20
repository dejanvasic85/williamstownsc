import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

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
    fixturesUrl,
    tableUrl
  }
`;

export async function getAllTeamsForSitemap() {
	const allTeamsQuery = groq`
		*[_type == "team"] {
			"slug": slug.current
		}
	`;

	const teams = await client.fetch<Array<{ slug: string }>>(
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
