import { defineField, defineType } from 'sanity';

export const person = defineType({
	name: 'person',
	title: 'Person',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Full name',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'photo',
			title: 'Photo',
			type: 'image',
			description: 'Preferrably a nice head shot of the person',
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
			name: 'dateOfBirth',
			title: 'Date of Birth (optional)',
			type: 'date',
			description: 'Used to calculate and display age on the website. Useful for players.'
		})
	],
	preview: {
		select: {
			title: 'name',
			media: 'photo'
		},
		prepare({ title, media }) {
			return {
				title,
				media
			};
		}
	}
});
