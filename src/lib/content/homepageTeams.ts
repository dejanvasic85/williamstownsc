import { groq } from 'next-sanity';

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
