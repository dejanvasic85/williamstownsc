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
import { locationsPage } from './pages/locationsPage';
import { merchandisePage } from './pages/merchandisePage';
import { policiesPage } from './pages/policiesPage';
import { privacyPage } from './pages/privacyPage';
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
	locationsPage,
	merchandisePage,
	policiesPage,
	privacyPage,
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
