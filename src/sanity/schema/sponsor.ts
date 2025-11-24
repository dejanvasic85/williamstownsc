import { defineField, defineType } from 'sanity';

export const sponsor = defineType({
	name: 'sponsor',
	title: 'Sponsor',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Sponsor Name',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'logo',
			title: 'Logo',
			type: 'image',
			options: {
				hotspot: true
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alt Text'
				}
			],
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'type',
			title: 'Sponsor Type',
			type: 'string',
			options: {
				list: [
					{ title: 'Principal', value: 'Principal' },
					{ title: 'Major', value: 'Major' },
					{ title: 'Community Partner', value: 'Community Partner' }
				]
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'text',
			rows: 3,
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'location',
			title: 'Location',
			type: 'string'
		}),
		defineField({
			name: 'contact',
			title: 'Contact',
			type: 'string',
			description: 'Phone number or email'
		}),
		defineField({
			name: 'website',
			title: 'Website URL',
			type: 'url',
			validation: (Rule) =>
				Rule.uri({
					scheme: ['http', 'https']
				})
		}),
		defineField({
			name: 'order',
			title: 'Display Order',
			type: 'number',
			description: 'Lower numbers appear first',
			initialValue: 100
		})
	],
	preview: {
		select: {
			title: 'name',
			media: 'logo',
			type: 'type'
		},
		prepare({ title, media, type }) {
			return {
				title,
				media,
				subtitle: type
			};
		}
	}
});
