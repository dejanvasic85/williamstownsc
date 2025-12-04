import { defineField, type Rule } from 'sanity';

/**
 * Common page heading field (H1 displayed on page and used in Studio preview)
 */
export const pageHeadingField = defineField({
	name: 'heading',
	title: 'Page Heading',
	type: 'string',
	description: 'Main H1 heading displayed on the page',
	validation: (Rule) => Rule.required()
});

/**
 * Common introduction field (simple portable text)
 */
export const introductionField = defineField({
	name: 'introduction',
	title: 'Introduction',
	type: 'array',
	of: [{ type: 'block' }],
	description: 'Opening/leading paragraph or introduction text'
});

/**
 * Rich text body configuration (no H1, has H2/H3, lists, links, images)
 */
const richTextBlockConfig = {
	type: 'block' as const,
	styles: [
		{ title: 'Normal', value: 'normal' },
		{ title: 'H2', value: 'h2' },
		{ title: 'H3', value: 'h3' }
	],
	lists: [
		{ title: 'Bullet', value: 'bullet' },
		{ title: 'Numbered', value: 'number' }
	],
	marks: {
		decorators: [
			{ title: 'Strong', value: 'strong' },
			{ title: 'Emphasis', value: 'em' }
		],
		annotations: [
			{
				name: 'link',
				type: 'object',
				title: 'Link',
				fields: [
					{
						name: 'href',
						type: 'url',
						title: 'URL'
					}
				]
			}
		]
	}
};

/**
 * Image configuration for rich text
 */
const richTextImageConfig = {
	type: 'image' as const,
	options: {
		hotspot: true
	},
	fields: [
		{
			name: 'alt',
			type: 'string',
			title: 'Alternative text',
			validation: (rule: Rule) => rule.required()
		},
		{
			name: 'caption',
			type: 'string',
			title: 'Caption'
		}
	]
};

/**
 * Rich text body field with images
 */
export const bodyField = defineField({
	name: 'body',
	title: 'Main Content',
	type: 'array',
	of: [richTextBlockConfig, richTextImageConfig]
});

/**
 * Rich text body field without images (for simpler pages)
 */
export const bodyFieldNoImages = defineField({
	name: 'body',
	title: 'Main Content',
	type: 'array',
	of: [richTextBlockConfig]
});

/**
 * Featured image field with alt text
 */
export const featuredImageField = defineField({
	name: 'featuredImage',
	title: 'Featured Image',
	type: 'image',
	description: 'Hero or featured image for the page',
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
});

/**
 * SEO field reference
 */
export const seoField = defineField({
	name: 'seo',
	title: 'SEO',
	type: 'seo'
});

/**
 * Published status field
 */
export const publishedField = defineField({
	name: 'published',
	title: 'Published',
	type: 'boolean',
	description: 'Set to true to make this page visible on the website',
	initialValue: true
});

/**
 * Published date field
 */
export const publishedAtField = defineField({
	name: 'publishedAt',
	title: 'Published Date',
	type: 'datetime',
	initialValue: () => new Date().toISOString()
});

/**
 * Last updated date field (for legal pages)
 */
export const lastUpdatedField = defineField({
	name: 'lastUpdated',
	title: 'Last Updated',
	type: 'datetime',
	description: 'Date this content was last updated',
	validation: (Rule) => Rule.required()
});
