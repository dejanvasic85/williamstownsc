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
								.title('About')
								.child(S.document().schemaType('aboutPage').documentId('aboutPage')),
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
								.title('Policies & Regulations')
								.child(S.document().schemaType('policiesPage').documentId('policiesPage')),
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

			// Content types - filter out page schemas and siteSettings
			...S.documentTypeListItems().filter(
				(listItem) =>
					![
						'siteSettings',
						'aboutPage',
						'contactPage',
						'committeePage',
						'locationsPage',
						'policiesPage',
						'privacyPage',
						'termsPage',
						'accessibilityPage'
					].includes(listItem.getId() ?? '')
			)
		]);
