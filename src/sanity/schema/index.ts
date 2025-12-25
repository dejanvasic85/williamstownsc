import { coach } from './coach';
import { committeeMember } from './committeeMember';
import { newsArticle } from './newsArticle';
// Objects
import { contactTypeContent } from './objects/contactTypeContent';
import { seo } from './objects/seo';
// Pages
import {
	aboutPage,
	accessibilityPage,
	committeePage,
	contactPage,
	eventsPage,
	homePage,
	locationsPage,
	merchandisePage,
	newsPage,
	policiesPage,
	privacyPage,
	programsPage,
	sponsorsPage,
	teamsPage,
	termsPage
} from './pages';
import { person } from './person';
import { player } from './player';
import { program } from './program';
import { siteSettings } from './siteSettings';
import { sponsor } from './sponsor';
import { team } from './team';

export const schemaTypes = [
	// Objects
	committeeMember,
	contactTypeContent,
	seo,

	// Pages
	aboutPage,
	accessibilityPage,
	committeePage,
	contactPage,
	eventsPage,
	homePage,
	locationsPage,
	merchandisePage,
	newsPage,
	policiesPage,
	privacyPage,
	programsPage,
	sponsorsPage,
	teamsPage,
	termsPage,

	// Content types
	newsArticle,
	person,
	team,
	coach,
	player,
	program,
	siteSettings,
	sponsor
];
