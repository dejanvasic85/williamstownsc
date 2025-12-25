import { coach } from './coach';
import { newsArticle } from './newsArticle';
// Objects
import { contactTypeContent } from './objects/contactTypeContent';
import { seo } from './objects/seo';
// Pages
import { aboutPage } from './pages/aboutPage';
import { accessibilityPage } from './pages/accessibilityPage';
import { committeePage } from './pages/committeePage';
import { contactPage } from './pages/contactPage';
import { eventsPage } from './pages/eventsPage';
import { homePage } from './pages/homePage';
import { locationsPage } from './pages/locationsPage';
import { merchandisePage } from './pages/merchandisePage';
import { newsPage } from './pages/newsPage';
import { policiesPage } from './pages/policiesPage';
import { privacyPage } from './pages/privacyPage';
import { programsPage } from './pages/programsPage';
import { sponsorsPage } from './pages/sponsorsPage';
import { teamsPage } from './pages/teamsPage';
import { termsPage } from './pages/termsPage';
import { person } from './person';
import { player } from './player';
import { program } from './program';
import { siteSettings } from './siteSettings';
import { sponsor } from './sponsor';
import { team } from './team';

export const schemaTypes = [
	// Objects
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
