import { defineField, defineType } from 'sanity';

export const seo = defineType({
	name: 'seo',
	title: 'SEO',
	type: 'object',
	fields: [
		defineField({
			name: 'metaTitle',
			title: 'Meta Title',
			type: 'string',
			description:
				'Page-specific title (will be combined with club name). Keep under 60 characters for best results.',
			validation: (Rule) =>
				Rule.max(60).warning('Titles over 60 characters may be truncated in search results')
		}),
		defineField({
			name: 'metaDescription',
			title: 'Meta Description',
			type: 'text',
			rows: 3,
			description: 'Brief description shown in search results. Keep under 160 characters.',
			validation: (Rule) =>
				Rule.max(160).warning('Descriptions over 160 characters may be truncated in search results')
		}),
		defineField({
			name: 'keywords',
			title: 'Keywords',
			type: 'array',
			of: [{ type: 'string' }],
			description: 'Keywords for SEO (optional)',
			options: {
				layout: 'tags'
			}
		}),
		defineField({
			name: 'ogTitle',
			title: 'Social Share Title',
			type: 'string',
			description: 'Title for social media shares (defaults to Meta Title if not set)',
			validation: (Rule) => Rule.max(60)
		}),
		defineField({
			name: 'ogDescription',
			title: 'Social Share Description',
			type: 'text',
			rows: 2,
			description: 'Description for social media shares (defaults to Meta Description if not set)',
			validation: (Rule) => Rule.max(160)
		}),
		defineField({
			name: 'ogImage',
			title: 'Social Share Image',
			type: 'image',
			description:
				'Image for social media shares (1200×630px recommended). Falls back to default if not set.',
			options: {
				hotspot: true
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alternative text'
				}
			]
		}),
		defineField({
			name: 'noIndex',
			title: 'Hide from Search Engines',
			type: 'boolean',
			description: 'Prevent this page from appearing in search results',
			initialValue: false
		})
	]
});
