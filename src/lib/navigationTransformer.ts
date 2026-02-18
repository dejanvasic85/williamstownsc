import { NavigationVisibility } from './content/navigationSettings';
import { NavItem } from './navigation';

export interface FooterNavLinks {
	navigation: Array<{ name: string; href: string }>;
	football: Array<{ name: string; href: string }>;
	club: Array<{ name: string; href: string }>;
	contact: Array<{ name: string; href: string }>;
}

export interface MenuLink {
	name: string;
	href: string;
	description: string;
}

// Map hrefs to visibility keys
const hrefToVisibilityKey: Record<string, keyof NavigationVisibility> = {
	'/football/programs': 'programs',
	'/football/merchandise': 'merchandise',
	'/club/about': 'about',
	'/club/committee': 'committee',
	'/club/policies-and-regulations': 'policies',
	'/club/locations': 'locations',
	'/sponsors': 'sponsors',
	'/contact': 'contact',
	'/key-dates': 'keyDates'
};

function shouldShowItem(href: string, visibility: NavigationVisibility): boolean {
	const visibilityKey = hrefToVisibilityKey[href];
	if (!visibilityKey) {
		// Not a toggleable item, always show (e.g., Home, News, Teams)
		return true;
	}
	return visibility[visibilityKey];
}

export function filterNavItems(navItems: NavItem[], visibility: NavigationVisibility): NavItem[] {
	return navItems
		.map((item) => {
			// If item has submenu, filter it
			if (item.submenu) {
				const filteredSubmenu = item.submenu.filter((subItem) =>
					shouldShowItem(subItem.href, visibility)
				);

				// Special case: Hide Club parent if all sub-items are hidden
				if (item.href === '/club' && filteredSubmenu.length === 0) {
					return null;
				}

				return {
					...item,
					submenu: filteredSubmenu
				};
			}

			// For top-level items, check if they should be shown
			if (!shouldShowItem(item.href, visibility)) {
				return null;
			}

			return item;
		})
		.filter((item): item is NavItem => item !== null);
}

export function buildFooterNavLinks(visibility: NavigationVisibility): FooterNavLinks {
	const navigation: Array<{ name: string; href: string }> = [
		{ name: 'Home', href: '/' },
		{ name: 'News', href: '/news' }
	];

	if (visibility.sponsors) {
		navigation.push({ name: 'Sponsors', href: '/sponsors' });
	}

	const football: Array<{ name: string; href: string }> = [
		{ name: 'Teams', href: '/football/teams' }
	];

	if (visibility.programs) {
		football.push({ name: 'Programs', href: '/football/programs' });
	}

	if (visibility.merchandise) {
		football.push({ name: 'Merchandise', href: '/football/merchandise' });
	}

	const club: Array<{ name: string; href: string }> = [];

	if (visibility.about) {
		club.push({ name: 'About', href: '/club/about' });
	}

	if (visibility.committee) {
		club.push({ name: 'Committee', href: '/club/committee' });
	}

	if (visibility.policies) {
		club.push({ name: 'Policies', href: '/club/policies-and-regulations' });
	}

	if (visibility.locations) {
		club.push({ name: 'Locations', href: '/club/locations' });
	}

	const contact: Array<{ name: string; href: string }> = [];

	if (visibility.contact) {
		contact.push({ name: 'Get in Touch', href: '/contact' });
	}

	return {
		navigation,
		football,
		club,
		contact
	};
}

export function filterMenuLinks(
	menuLinks: MenuLink[],
	visibility: NavigationVisibility
): MenuLink[] {
	return menuLinks.filter((link) => shouldShowItem(link.href, visibility));
}
