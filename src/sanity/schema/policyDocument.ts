import { defineField, defineType } from 'sanity';

export const policyDocument = defineType({
	name: 'policyDocument',
	title: 'Policy Document',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: {
				list: [
					{ title: 'Club Policies', value: 'Club Policies' },
					{ title: 'Football Victoria Policies', value: 'Football Victoria Policies' },
					{ title: 'By-Laws & Constitutions', value: 'By-Laws & Constitutions' }
				],
				layout: 'dropdown'
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'file',
			title: 'PDF File',
			type: 'file',
			options: {
				accept: 'application/pdf'
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'description',
			title: 'Description',
			description: 'Short summary of the document',
			type: 'text',
			rows: 3
		}),
		defineField({
			name: 'effectiveDate',
			title: 'Effective Date',
			description: 'Date when this policy became effective',
			type: 'date'
		}),
		defineField({
			name: 'order',
			title: 'Order',
			description: 'Sort order within category (lower numbers appear first)',
			type: 'number',
			initialValue: 0
		}),
		defineField({
			name: 'published',
			title: 'Published',
			description: 'Controls visibility on the website',
			type: 'boolean',
			initialValue: true
		})
	],
	preview: {
		select: {
			title: 'title',
			category: 'category'
		},
		prepare({ title, category }) {
			return {
				title,
				subtitle: category || 'No category'
			};
		}
	}
});
