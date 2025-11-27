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
			options: {
				list: [
					{ title: 'Head Coach', value: 'headCoach' },
					{ title: 'Assistant Coach', value: 'assistantCoach' },
					{ title: 'Goalkeeper Coach', value: 'goalkeeperCoach' },
					{ title: 'Team Manager', value: 'teamManager' },
					{ title: 'Physio', value: 'physio' }
				]
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
