import { defineField, defineType } from 'sanity';

export const coach = defineType({
	name: 'coach',
	title: 'Coach',
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
			description: 'Optional. Use a different photo when this person appears as a coach.',
			options: { hotspot: true },
			fields: [
				defineField({
					name: 'alt',
					type: 'string',
					title: 'Alt Text',
					validation: (Rule) => Rule.required()
				})
			]
		}),
		defineField({
			name: 'title',
			title: 'Coaching Title',
			type: 'string',
			options: {
				list: ['Head Coach', 'Assistant Coach', 'Goalkeeper Coach', 'Team Manager', 'Physio']
			},
			validation: (Rule) => Rule.required()
		})
	],
	preview: {
		select: {
			personName: 'person.name',
			title: 'title'
		},
		prepare({ personName, title }) {
			return {
				title: personName || 'Unknown Person',
				subtitle: title
			};
		}
	}
});
