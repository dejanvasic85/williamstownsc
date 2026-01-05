import { defineField, defineType } from 'sanity';

export const announcement = defineType({
	name: 'announcement',
	title: 'Site Announcement',
	type: 'document',
	fields: [
		defineField({
			name: 'type',
			title: 'Announcement Type',
			type: 'string',
			description: 'The visual style of the announcement',
			options: {
				list: [
					{ title: 'Info (Blue)', value: 'info' },
					{ title: 'Warning (Yellow)', value: 'warning' },
					{ title: 'Alert (Red)', value: 'alert' }
				],
				layout: 'radio'
			},
			initialValue: 'info',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'message',
			title: 'Message',
			type: 'text',
			rows: 2,
			description: 'Keep it short and concise up to 45 characters for best mobile view',
			validation: (Rule) => Rule.required().max(45)
		}),
		defineField({
			name: 'endDate',
			title: 'End Date',
			type: 'date',
			description: 'The date when the announcement should end',
			validation: (Rule) => Rule.required()
		})
	],
	preview: {
		select: {
			message: 'message',
			type: 'type'
		},
		prepare({ message, type }) {
			const typeLabels: Record<string, string> = {
				info: 'Info',
				warning: 'Warning',
				alert: 'Alert'
			};
			return {
				title: message || 'No message set',
				subtitle: `${typeLabels[type] || type}`
			};
		}
	}
});
