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
			name: 'featuredImage',
			title: 'Featured Image',
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
		})
	],
	preview: {
		select: {
			title: 'title',
			media: 'featuredImage',
			publishedAt: 'publishedAt'
		},
		prepare({ title, media, publishedAt }) {
			return {
				title,
				media,
				subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'
			};
		}
	}
});
