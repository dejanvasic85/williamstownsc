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
			description:
				'Upload a landscape logo at 4:3 ratio (recommended: 800×600px). PNG with transparent background preferred.',
			options: {
				hotspot: true
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alt Text',
					validation: (Rule) => Rule.required()
				}
			],
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'type',
			title: 'Sponsor Type',
			type: 'reference',
			to: [{ type: 'sponsorType' }],
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
		}),
		defineField({
			name: 'showOnHomepage',
			title: 'Show on Homepage',
			type: 'boolean',
			description: 'Display this sponsor on the homepage',
			initialValue: false
		})
	],
	preview: {
		select: {
			title: 'name',
			media: 'logo',
			order: 'order'
		},
		prepare({ title, media, order }) {
			return {
				title,
				subtitle: `Order: ${order}`,
				media
			};
		}
	}
});
