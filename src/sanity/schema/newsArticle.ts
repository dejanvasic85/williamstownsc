import { defineField, defineType } from 'sanity';

export const newsArticle = defineType({
	name: 'newsArticle',
	title: 'News Article',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'slug',
			description: 'The slug is a section of the Page URL (address) that identifies the article.',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'publishedAt',
			title: 'Published Date',
			type: 'datetime',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'expiryDate',
			title: 'Expiry Date',
			description:
				'Optional date when this article should no longer be displayed. Leave empty for no expiration.',
			type: 'datetime'
		}),
		defineField({
			name: 'featuredImage',
			title: 'Featured Image',
			description:
				'Desktop hero image (landscape, min 1920×1080). Also used for news cards, article pages, and social sharing.',
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
			name: 'mobileImage',
			title: 'Mobile Hero Image',
			description:
				'Square image (~1080×1080) for the mobile hero carousel. Falls back to the featured image if not set.',
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
			hidden: ({ document }) => !document?.featured
		}),
		defineField({
			name: 'excerpt',
			title: 'Excerpt',
			type: 'text',
			rows: 3,
			validation: (Rule) => Rule.required().max(200)
		}),
		defineField({
			name: 'content',
			title: 'Content',
			type: 'array',
			of: [
				{
					type: 'block'
				},
				{
					type: 'image',
					options: {
						hotspot: true
					},
					fields: [
						{
							name: 'alt',
							type: 'string',
							title: 'Alt Text'
						},
						{
							name: 'caption',
							type: 'string',
							title: 'Caption'
						}
					]
				}
			]
		}),
		defineField({
			name: 'featured',
			title: 'Featured',
			type: 'boolean',
			description: 'Show in hero carousel',
			initialValue: false
		}),
		defineField({
			name: 'publishToFacebook',
			title: 'Publish to Facebook',
			type: 'boolean',
			description: 'Auto-post to Facebook when published',
			initialValue: false
		}),
		defineField({
			name: 'publishToInstagram',
			title: 'Publish to Instagram',
			type: 'boolean',
			description: 'Auto-post to Instagram when published',
			initialValue: false
		})
	],
	preview: {
		select: {
			title: 'title',
			media: 'featuredImage',
			publishedAt: 'publishedAt',
			featured: 'featured'
		},
		prepare({ title, media, publishedAt, featured }) {
			const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date';
			return {
				title,
				media,
				subtitle: featured ? `★ Featured · ${date}` : date
			};
		}
	}
});
