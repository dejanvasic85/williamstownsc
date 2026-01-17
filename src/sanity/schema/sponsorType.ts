import { defineField, defineType } from 'sanity';

export const sponsorType = defineType({
	name: 'sponsorType',
	title: 'Sponsor Type',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Type Name',
			type: 'string',
			description: 'e.g., Principal, Major, Community Partner',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'text',
			rows: 3,
			description: 'Brief description of this sponsor type and its benefits'
		}),
		defineField({
			name: 'order',
			title: 'Display Order',
			type: 'number',
			description: 'Lower numbers appear first',
			initialValue: 100,
			validation: (Rule) => Rule.required()
		})
	],
	preview: {
		select: {
			title: 'name',
			order: 'order'
		},
		prepare({ title, order }) {
			return {
				title,
				subtitle: `Order: ${order}`
			};
		}
	}
});
