import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
	name: 'siteSettings',
	title: 'Site Settings',
	type: 'document',
	fields: [
		defineField({
			name: 'clubName',
			title: 'Club Name',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'tagline',
			title: 'Tagline',
			type: 'string',
			description: 'Short description or tagline for the club'
		}),
		defineField({
			name: 'description',
			title: 'Club Description',
			type: 'text',
			rows: 4,
			description: 'Longer description of the club'
		}),
		defineField({
			name: 'logo',
			title: 'Club Logo',
			type: 'image',
			options: {
				hotspot: true
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alternative text',
					validation: (Rule) => Rule.required()
				}
			],
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'locations',
			title: 'Locations',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{
							name: 'name',
							title: 'Location Name',
							type: 'string',
							validation: (Rule) => Rule.required()
						},
						{
							name: 'facilityType',
							title: 'Facility Type',
							type: 'string',
							options: {
								list: [
									{ title: 'Home Ground', value: 'home' },
									{ title: 'Training Ground', value: 'training' },
									{ title: 'Other', value: 'other' }
								]
							}
						},
						{
							name: 'address',
							title: 'Address',
							type: 'text',
							rows: 2,
							validation: (Rule) => Rule.required()
						},
						{
							name: 'mapLink',
							title: 'Map Link',
							type: 'url',
							description: 'Google Maps or similar link'
						}
					],
					preview: {
						select: {
							title: 'name',
							subtitle: 'facilityType'
						}
					}
				}
			]
		}),
		defineField({
			name: 'contact',
			title: 'Contact Information',
			type: 'object',
			fields: [
				{
					name: 'email',
					title: 'Email',
					type: 'string',
					validation: (Rule) => Rule.email()
				},
				{
					name: 'phone',
					title: 'Phone',
					type: 'string'
				}
			]
		}),
		defineField({
			name: 'socials',
			title: 'Social Media',
			type: 'object',
			fields: [
				{
					name: 'facebook',
					title: 'Facebook',
					type: 'url'
				},
				{
					name: 'instagram',
					title: 'Instagram',
					type: 'url'
				},
				{
					name: 'twitter',
					title: 'X (Twitter)',
					type: 'url'
				},
				{
					name: 'youtube',
					title: 'YouTube',
					type: 'url'
				}
			]
		}),
		defineField({
			name: 'seo',
			title: 'SEO Defaults',
			type: 'object',
			fields: [
				{
					name: 'metaDescription',
					title: 'Default Meta Description',
					type: 'text',
					rows: 3,
					validation: (Rule) => Rule.max(160)
				},
				{
					name: 'ogImage',
					title: 'Default OG Image',
					type: 'image',
					description: 'Default image for social media sharing',
					options: {
						hotspot: true
					}
				}
			]
		}),
		defineField({
			name: 'footerText',
			title: 'Footer Text',
			type: 'text',
			rows: 2,
			description: 'Copyright notice or additional footer text'
		}),
		defineField({
			name: 'emergencyNotice',
			title: 'Emergency Notice',
			type: 'object',
			description: 'Display urgent alerts for closures, weather updates, etc.',
			fields: [
				{
					name: 'enabled',
					title: 'Show Notice',
					type: 'boolean',
					initialValue: false
				},
				{
					name: 'message',
					title: 'Notice Message',
					type: 'text',
					rows: 3
				},
				{
					name: 'type',
					title: 'Notice Type',
					type: 'string',
					options: {
						list: [
							{ title: 'Info', value: 'info' },
							{ title: 'Warning', value: 'warning' },
							{ title: 'Alert', value: 'alert' }
						]
					},
					initialValue: 'info'
				}
			]
		})
	],
	preview: {
		select: {
			title: 'clubName',
			subtitle: 'tagline'
		}
	}
});
