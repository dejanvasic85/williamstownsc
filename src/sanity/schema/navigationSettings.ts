import { defineField, defineType } from 'sanity';

export const navigationSettings = defineType({
	name: 'navigationSettings',
	title: 'Navigation Settings',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			initialValue: 'Navigation Settings',
			readOnly: true,
			hidden: true
		}),
		defineField({
			name: 'programs',
			title: 'Show Programs',
			type: 'boolean',
			description: 'Show "Programs" in Football submenu and footer',
			initialValue: true
		}),
		defineField({
			name: 'merchandise',
			title: 'Show Merchandise',
			type: 'boolean',
			description: 'Show "Merchandise" in Football submenu and footer',
			initialValue: true
		}),
		defineField({
			name: 'about',
			title: 'Show About',
			type: 'boolean',
			description: 'Show "About" in Club submenu, footer, and menu page',
			initialValue: true
		}),
		defineField({
			name: 'committee',
			title: 'Show Committee',
			type: 'boolean',
			description: 'Show "Committee" in Club submenu, footer, and menu page',
			initialValue: true
		}),
		defineField({
			name: 'policies',
			title: 'Show Policies & Regulations',
			type: 'boolean',
			description: 'Show "Policies & Regulations" in Club submenu, footer, and menu page',
			initialValue: true
		}),
		defineField({
			name: 'locations',
			title: 'Show Locations',
			type: 'boolean',
			description: 'Show "Locations" in Club submenu, footer, and menu page',
			initialValue: true
		}),
		defineField({
			name: 'sponsors',
			title: 'Show Sponsors',
			type: 'boolean',
			description: 'Show "Sponsors" in desktop nav, footer, and menu page',
			initialValue: true
		}),
		defineField({
			name: 'contact',
			title: 'Show Contact',
			type: 'boolean',
			description: 'Show "Contact" in desktop nav, footer, and menu page',
			initialValue: true
		}),
		defineField({
			name: 'keyDates',
			title: 'Show Key Dates',
			type: 'boolean',
			description: 'Show "Key Dates" in desktop nav',
			initialValue: true
		})
	],
	preview: {
		prepare() {
			return {
				title: 'Navigation Settings'
			};
		}
	}
});
