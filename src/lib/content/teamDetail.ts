import { groq } from 'next-sanity';

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
