## Features

This is a website for a local football club. The following is a list of features that are required for the website to be considered complete.

The original website is at https://www.williamstownsc.com/

### Must have

- [x] Integrate Sanity CMS
- [x] Configure Daisy theme for Williamstown (light and dark)
- [x] Layout
  - [x] Navbar (mobile and desktop)
    - [x] Submenu
  - [x] Footer
  - [x] Favicon
- [x] Links to socials
- [x] Custom not found page
- [x] Custom error page
- Google structured data
  - [x] Add organisation @type": "SportsOrganization" to the root layout
  - [x] Refactor the getMetadata because it's atrocious
  - [x] Refactor each page to return getMetadata instead of redeclaring the object (unless required)
- [x] Cache invalidation on content publish
- [x] Dark theme
- [ ] Accessibility audit and fixes
- SEO
  - [x] Remove the Keywords because it creates confusion
  - [x] Social Share Title falls back to meta Title
  - [x] Social Share Description – Same logic, the fallback is fine
  - [x] Dynamic sitemap generation with static and CMS content
  - [ ] robots.txt configuration for search engine crawlers
  - [ ] RSS/Atom feed for news articles
  - [ ] Breadcrumb navigation with BreadcrumbList schema
  - [ ] Web Vitals monitoring and performance tracking
  - [ ] URL redirects configuration for legacy paths
  - [ ] Enhanced unique meta descriptions for all pages
  - [ ] Structured data for Events (Event schema)
  - [ ] Structured data for committee/staff (Person schema)
  - [ ] Code splitting and lazy loading optimization

Pages:

- Homepage
  - [x] Hero section, news, football and sponsors
  - [x] Key dates section
  - [x] Important announcements like ground closures section

- News
  - [x] Article page
    - [ ] Similar news
  - [ ] Match report page?
    - [ ] Previous / next week links
- Football
  - [x] Team listings
    - [x] Seniors, reserves + women with profiles
    - [x] All other teams with coaches details and other useful information like start / end dates
    - [ ] Fixtures
  - [x] Programs (Summer programs, Mino roos)
  - [x] Merchandise page
- Club
  - [x] About and History
  - [x] Org, committee members and contacts
  - [x] Policies and regulations
  - [x] Locations including JT Gray and Digman and their layouts
  - [x] Sponsors
- Contact
  - [x] Contact form
  - [x] Bot detection
- General
  - [x] Terms and conditions
  - [x] Privacy policy
  - [ ] Accessibility statement (what should we aim for? Double A?)

### Nice to have

The following is a list of things we may be not need on initial launch and can come later:

- Events
  - [ ] Ticketing integration with Try Booking
- [ ] Automatic team Fixtures
- [ ] Match reports
- [ ] Search
- [ ] Publish news to facebook, instagram
- [ ] Publishing schedule, results and tables
- [ ] Senior team match reports with You Tube embed of highlights or full match
- [ ] Space for links and general info on Regulations and rules

---
