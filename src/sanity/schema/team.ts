import { defineField, defineType } from 'sanity';

export const team = defineType({
	name: 'team',
	title: 'Team',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Team name',
			description: 'Name of the team e.g. Senior Womens or U/12 Girls Kangas',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'photo',
			title: 'Photo',
			type: 'image',
			description: 'Can be a generated image until we have a real team photo',
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
			name: 'order',
			title: 'Display Order',
			type: 'number',
			description: 'Lower numbers appear first',
			initialValue: 100
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'array',
			of: [{ type: 'block' }],
			description:
				'Promote the team here by listing achievements and/or when they usually train/play.',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'coachingStaff',
			title: 'Coaching Staff',
			type: 'array',
			of: [{ type: 'coach' }],
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'players',
			title: 'Players',
			type: 'array',
			of: [{ type: 'player' }],
			description: 'Team roster including captains and vice captains'
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
