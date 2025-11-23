export const navItems = [
	{ name: 'Home', href: '/' },
	{ name: 'News', href: '/news' },
	{
		name: 'Football',
		href: '/football',
		submenu: [
			{ name: 'Teams', href: '/football/teams' },
			{ name: 'Programs', href: '/football/programs' },
			{ name: 'Merchandise', href: '/football/merchandise' }
		]
	},
	{
		name: 'Club',
		href: '/club',
		submenu: [
			{ name: 'About', href: '/club/about' },
			{ name: 'Organizations', href: '/club/organizations' },
			{ name: 'Policies and regulations', href: '/club/policies-and-regulations' },
			{ name: 'Locations', href: '/club/locations' }
		]
	},
	{ name: 'Sponsors', href: '/sponsors' },
	{ name: 'Contact', href: '/contact' },
	{ name: 'Events', href: '/events' }
];
