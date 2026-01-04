import { defineField, defineType } from 'sanity';

export const announcement = defineType({
	name: 'announcement',
	title: 'Site Announcement',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			description: "Internal title for organization (optional - won't be displayed)",
			validation: (Rule) => Rule.max(100)
		}),
		defineField({
			name: 'enabled',
			title: 'Show Announcement',
			type: 'boolean',
			description: 'Toggle to show or hide this announcement banner',
			initialValue: false
		}),
		defineField({
			name: 'order',
			title: 'Display Order',
			type: 'number',
			description: 'Lower numbers appear first (1 = highest priority)',
			initialValue: 1,
			validation: (Rule) => Rule.min(1).max(100).required()
		}),
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
			description: 'The announcement message to display (keep it short and concise)',
			validation: (Rule) => Rule.required().max(200)
		}),
		defineField({
			name: 'link',
			title: 'Link (Optional)',
			type: 'object',
			description: 'Optional link for more information',
			fields: [
				{
					name: 'text',
					title: 'Link Text',
					type: 'string',
					description: 'e.g., "Learn more", "View details"'
				},
				{
					name: 'url',
					title: 'URL',
					type: 'url',
					validation: (Rule) =>
						Rule.uri({
							allowRelative: true,
							scheme: ['http', 'https', 'mailto', 'tel']
						})
				}
			]
		})
	],
	preview: {
		select: {
			message: 'message',
			type: 'type',
			enabled: 'enabled'
		},
		prepare({ message, type, enabled }) {
			const typeLabels: Record<string, string> = {
				info: 'Info',
				warning: 'Warning',
				alert: 'Alert'
			};
			return {
				title: message || 'No message set',
				subtitle: `${typeLabels[type] || type} - ${enabled ? 'Visible' : 'Hidden'}`
			};
		}
	}
});
