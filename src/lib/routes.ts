/**
 * Centralized route configuration.
 * Single source of truth for all application routes used by navigation and search.
 */

export const routes = {
	// Dynamic routes
	newsArticle: (slug: string) => `/news/${slug}`,
	team: (slug: string) => `/football/teams/${slug}`,

	// Football section
	program: () => '/football/programs',
	programs: () => '/football/programs',
	merchandise: () => '/football/merchandise',
	teams: () => '/football/teams',

	// Club section
	about: () => '/club/about',
	committee: () => '/club/committee',
	locations: () => '/club/locations',

	// Root-level pages
	accessibility: () => '/accessibility',
	contact: () => '/contact',
	keyDates: () => '/key-dates',
	news: () => '/news',
	policies: () => '/policies',
	privacy: () => '/privacy',
	sponsors: () => '/sponsors',
	terms: () => '/terms'
};

/**
 * Maps Sanity content types to route functions.
 * Used by search to generate URLs for results.
 */
export const contentTypeRoutes: Record<string, (slug?: string) => string> = {
	// Dynamic content - fall back to list page when slug is missing
	newsArticle: (slug) => (slug ? routes.newsArticle(slug) : routes.news()),
	team: (slug) => (slug ? routes.team(slug) : routes.teams()),
	program: () => routes.program(),

	// Page types
	aboutPage: () => routes.about(),
	accessibilityPage: () => routes.accessibility(),
	committeePage: () => routes.committee(),
	contactPage: () => routes.contact(),
	keyDatesPage: () => routes.keyDates(),
	locationsPage: () => routes.locations(),
	merchandisePage: () => routes.merchandise(),
	newsPage: () => routes.news(),
	policiesPage: () => routes.policies(),
	privacyPage: () => routes.privacy(),
	programsPage: () => routes.programs(),
	sponsorsPage: () => routes.sponsors(),
	teamsPage: () => routes.teams(),
	termsPage: () => routes.terms()
};
