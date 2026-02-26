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
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			description: 'URL-friendly identifier for this team',
			options: {
				source: 'name',
				maxLength: 96
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'photo',
			title: 'Photo',
			type: 'image',
			description:
				'Can be a generated image until we have a real team photo. Please use wide shots for best results.',
			options: {
				hotspot: true
			}
		}),
		defineField({
			name: 'gender',
			title: 'Gender',
			type: 'string',
			options: {
				list: [
					{
						title: 'Male',
						value: 'male'
					},
					{
						title: 'Female',
						value: 'female'
					},
					{
						title: 'Mixed',
						value: 'mixed'
					}
				]
			}
		}),
		defineField({
			name: 'ageGroup',
			title: 'Age group',
			type: 'string',
			options: {
				list: [
					{
						title: 'Seniors',
						value: 'seniors'
					},
					{
						title: 'Reserves',
						value: 'reserves'
					},
					{
						title: 'Masters',
						value: 'masters'
					},
					{
						title: `Over 45's`,
						value: 'over45'
					},
					{
						title: 'Metros',
						value: 'metros'
					},
					{
						title: 'Under 18',
						value: '18'
					},
					{
						title: 'Under 17',
						value: '17'
					},
					{
						title: 'Under 16',
						value: '16'
					},
					{
						title: 'Under 15',
						value: '15'
					},
					{
						title: 'Under 14',
						value: '14'
					},
					{
						title: 'Under 13',
						value: '13'
					},
					{
						title: 'Under 12',
						value: '12'
					},
					{
						title: 'Under 11',
						value: '11'
					},
					{
						title: 'Under 10',
						value: '10'
					},
					{
						title: 'Under 9',
						value: '9'
					},
					{
						title: 'Under 8',
						value: '8'
					},
					{
						title: 'Under 7',
						value: '7'
					},
					{
						title: 'Under 6',
						value: '6'
					}
				]
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'order',
			title: 'Order',
			type: 'number',
			description: 'Order in which the team should appear on the website within the same age group',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'showOnHomepage',
			title: 'Show on homepage',
			type: 'boolean',
			description: 'Display this team in the homepage Football section',
			initialValue: false
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'array',
			of: [{ type: 'block' }],
			description:
				'Promote the team here by listing achievements and/or when they usually train/play.'
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
		}),
		defineField({
			name: 'fixturesUrl',
			title: 'Fixtures URL',
			type: 'url',
			description: 'External link to team fixtures'
		}),
		defineField({
			name: 'tableUrl',
			title: 'Table URL',
			type: 'url',
			description: 'External link to team table/ladder'
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
