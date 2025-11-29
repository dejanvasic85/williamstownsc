import { groq } from 'next-sanity';

export const seniorTeamsQuery = groq`
  *[_type == "team" && ageGroup == "seniors"] | order(order asc) [0...2] {
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
