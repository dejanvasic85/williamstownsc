import { StructureBuilder } from 'sanity/structure';

export const structure = (S: StructureBuilder) =>
	S.list()
		.title('Content')
		.items([
			S.listItem()
				.title('Site Settings')
				.child(S.document().schemaType('siteSettings').documentId('siteSettings')),
			S.divider(),
			...S.documentTypeListItems().filter((listItem) => listItem.getId() !== 'siteSettings')
		]);
