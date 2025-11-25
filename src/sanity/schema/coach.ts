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
			name: 'title',
			title: 'Coaching Title',
			type: 'string',
			description: 'e.g. Head Coach, Assistant Coach, Goalkeeper Coach',
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
