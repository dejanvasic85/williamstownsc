import { defineField, defineType } from 'sanity';

export const committeeMember = defineType({
	name: 'committeeMember',
	title: 'Committee Member',
	type: 'object',
	fields: [
		defineField({
			name: 'person',
			title: 'Person',
			type: 'reference',
			to: [{ type: 'person' }],
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'photo',
			title: 'Role Photo',
			type: 'image',
			description:
				'Optional. Use a different photo when this person appears as a committee member.',
			options: { hotspot: true },
			fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }]
		}),
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			description: 'Committee role e.g. President, Vice President, Secretary, Treasurer',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'order',
			title: 'Order',
			type: 'number',
			description: 'Order in which the member should appear (1 = first)',
			validation: (Rule) => Rule.required().min(1)
		})
	],
	preview: {
		select: {
			personName: 'person.name',
			title: 'title',
			order: 'order'
		},
		prepare({ personName, title, order }) {
			return {
				title: `${order}. ${personName || 'Unknown Person'}`,
				subtitle: title
			};
		}
	}
});
