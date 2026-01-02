import { defineType } from 'sanity';

export const keyDateItem = defineType({
	name: 'keyDateItem',
	title: 'Key Date',
	type: 'object',
	fields: [
		{
			name: 'title',
			title: 'Title',
			type: 'string',
			description: 'Name of the event or milestone (e.g., "Season Launch", "Registration Closes")',
			validation: (Rule) => Rule.required()
		},
		{
			name: 'date',
			title: 'Date',
			type: 'date',
			description: 'The date of this event',
			validation: (Rule) => Rule.required()
		},
		{
			name: 'description',
			title: 'Description',
			type: 'text',
			rows: 2,
			description: 'Optional additional details about this date'
		}
	],
	preview: {
		select: {
			title: 'title',
			date: 'date'
		},
		prepare({ title, date }) {
			const formattedDate = date
				? new Date(date).toLocaleDateString('en-AU', {
						day: 'numeric',
						month: 'short',
						year: 'numeric'
					})
				: 'No date';
			return {
				title: title || 'Untitled',
				subtitle: formattedDate
			};
		}
	}
});
