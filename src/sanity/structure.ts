import { StructureBuilder } from 'sanity/structure';

export const structure = (S: StructureBuilder) =>
	S.list()
		.title('Content')
		.items([
			S.listItem()
				.title('Site Settings')
				.child(S.document().schemaType('siteSettings').documentId('siteSettings')),
			S.divider(),

			// Pages section
			S.listItem()
				.title('Pages')
				.child(
					S.list()
						.title('Pages')
						.items([
							S.listItem()
								.title('Home')
								.child(S.document().schemaType('homePage').documentId('homePage')),
							S.listItem()
								.title('News')
								.child(S.document().schemaType('newsPage').documentId('newsPage')),
							S.listItem()
								.title('About')
								.child(S.document().schemaType('aboutPage').documentId('aboutPage')),
							S.listItem()
								.title('Teams')
								.child(S.document().schemaType('teamsPage').documentId('teamsPage')),
							S.listItem()
								.title('Programs')
								.child(S.document().schemaType('programsPage').documentId('programsPage')),
							S.listItem()
								.title('Contact')
								.child(S.document().schemaType('contactPage').documentId('contactPage')),
							S.listItem()
								.title('Committee')
								.child(S.document().schemaType('committeePage').documentId('committeePage')),
							S.listItem()
								.title('Locations')
								.child(S.document().schemaType('locationsPage').documentId('locationsPage')),
							S.listItem()
								.title('Merchandise')
								.child(S.document().schemaType('merchandisePage').documentId('merchandisePage')),
							S.listItem()
								.title('Policies & Regulations')
								.child(S.document().schemaType('policiesPage').documentId('policiesPage')),
							S.listItem()
								.title('Sponsors')
								.child(S.document().schemaType('sponsorsPage').documentId('sponsorsPage')),
							S.listItem()
								.title('Key Dates')
								.child(S.document().schemaType('keyDatesPage').documentId('keyDatesPage')),
							S.divider(),
							S.listItem()
								.title('Privacy Policy')
								.child(S.document().schemaType('privacyPage').documentId('privacyPage')),
							S.listItem()
								.title('Terms of Service')
								.child(S.document().schemaType('termsPage').documentId('termsPage')),
							S.listItem()
								.title('Accessibility Statement')
								.child(S.document().schemaType('accessibilityPage').documentId('accessibilityPage'))
						])
				),
			S.divider(),

			// Content types - page schemas are organized separately above, siteSettings appears at the top
			...S.documentTypeListItems().filter(
				(listItem) =>
					![
						'siteSettings',
						'aboutPage',
						'accessibilityPage',
						'committeePage',
						'contactPage',
						'homePage',
						'keyDatesPage',
						'locationsPage',
						'merchandisePage',
						'newsPage',
						'policiesPage',
						'privacyPage',
						'programsPage',
						'sponsorsPage',
						'teamsPage',
						'termsPage'
					].includes(listItem.getId() ?? '')
			)
		]);
