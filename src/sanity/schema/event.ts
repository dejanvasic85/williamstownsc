import { defineField, defineType } from 'sanity';

export const event = defineType({
	name: 'event',
	title: 'Event',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'slug',
			description: 'The slug is a section of the Page URL (address) that identifies the event.',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'eventDate',
			title: 'Event Date',
			type: 'datetime',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'endDate',
			title: 'End Date',
			type: 'datetime',
			description: 'Optional end date for multi-day events'
		}),
		defineField({
			name: 'location',
			title: 'Location',
			type: 'string',
			description: 'Event venue or location name'
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: {
				list: [
					{ title: 'Match', value: 'match' },
					{ title: 'Training', value: 'training' },
					{ title: 'Social Event', value: 'social' },
					{ title: 'Fundraiser', value: 'fundraiser' },
					{ title: 'Meeting', value: 'meeting' },
					{ title: 'Other', value: 'other' }
				],
				layout: 'dropdown'
			},
			validation: (Rule) => Rule.required(),
			initialValue: 'other'
		}),
		defineField({
			name: 'featuredImage',
			title: 'Featured Image',
			type: 'image',
			options: {
				hotspot: true
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alt Text'
				}
			],
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'excerpt',
			title: 'Excerpt',
			type: 'text',
			rows: 3,
			description: 'Brief description shown in event listings',
			validation: (Rule) => Rule.required().max(200)
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'array',
			of: [
				{
					type: 'block'
				},
				{
					type: 'image',
					options: {
						hotspot: true
					},
					fields: [
						{
							name: 'alt',
							type: 'string',
							title: 'Alt Text'
						},
						{
							name: 'caption',
							type: 'string',
							title: 'Caption'
						}
					]
				}
			]
		}),
		defineField({
			name: 'requiresTickets',
			title: 'Requires Tickets',
			type: 'boolean',
			description: 'Does this event require ticket booking?',
			initialValue: false
		}),
		defineField({
			name: 'eventUrl',
			title: 'Event Booking URL',
			type: 'url',
			description: 'External link to event booking page (e.g., TryBooking, Eventbrite)',
			hidden: ({ parent }) => !parent?.requiresTickets
		}),
		defineField({
			name: 'isFree',
			title: 'Free Event',
			type: 'boolean',
			description: 'Is this a free event?',
			initialValue: true
		}),
		defineField({
			name: 'featured',
			title: 'Featured',
			type: 'boolean',
			description: 'Show in featured events section',
			initialValue: false
		}),
		defineField({
			name: 'published',
			title: 'Published',
			type: 'boolean',
			description: 'Set to true to make this event visible on the website',
			initialValue: true
		})
	],
	preview: {
		select: {
			title: 'title',
			media: 'featuredImage',
			eventDate: 'eventDate',
			category: 'category'
		},
		prepare({ title, media, eventDate, category }) {
			return {
				title,
				media,
				subtitle: `${category ? `${category} | ` : ''}${eventDate ? new Date(eventDate).toLocaleDateString() : 'No date'}`
			};
		}
	}
});
