import { defineType } from 'sanity';

export const contactTypeContent = defineType({
	name: 'contactTypeContent',
	title: 'Contact Type Content',
	type: 'object',
	fields: [
		{
			name: 'heading',
			type: 'string',
			title: 'Heading',
			description: 'Main heading for this contact type (e.g., "Join the Williamstown SC Family")',
			validation: (Rule) => Rule.required()
		},
		{
			name: 'introduction',
			type: 'array',
			of: [{ type: 'block' }],
			title: 'Introduction',
			description: 'Introduction text (2-3 paragraphs recommended)',
			validation: (Rule) => Rule.required()
		},
		{
			name: 'image',
			type: 'image',
			title: 'Featured Image',
			description: 'Optional image for this contact type',
			options: {
				hotspot: true
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alternative text',
					description: 'Describe the image for accessibility'
				}
			]
		},
		{
			name: 'ctaText',
			type: 'string',
			title: 'Submit Button Text',
			description: 'Text for the form submit button',
			initialValue: 'Submit Enquiry',
			validation: (Rule) => Rule.required()
		}
	]
});
