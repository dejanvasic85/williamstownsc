import { defineField, defineType } from 'sanity';

export const program = defineType({
	name: 'program',
	title: 'Program',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Program Name',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
				maxLength: 96
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'startDate',
			title: 'Start Date',
			type: 'date',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'endDate',
			title: 'End Date',
			type: 'date',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'minAge',
			title: 'Minimum Age',
			type: 'number',
			validation: (Rule) => Rule.required().min(0).max(99)
		}),
		defineField({
			name: 'maxAge',
			title: 'Maximum Age',
			type: 'number',
			validation: (Rule) => Rule.required().min(0).max(99)
		}),
		defineField({
			name: 'image',
			title: 'Program Image',
			type: 'image',
			options: {
				hotspot: true
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alternative text',
					description: 'Important for SEO and accessibility'
				}
			]
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'array',
			of: [
				{
					type: 'block',
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
						]
					}
				}
			]
		}),
		defineField({
			name: 'active',
			title: 'Active',
			type: 'boolean',
			initialValue: true,
			description: 'Set to false to hide this program from the website'
		})
	],
	preview: {
		select: {
			title: 'name',
			startDate: 'startDate',
			endDate: 'endDate',
			media: 'image'
		},
		prepare({ title, startDate, endDate, media }) {
			const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : 'No dates set';
			return {
				title,
				subtitle: dateRange,
				media
			};
		}
	}
});
