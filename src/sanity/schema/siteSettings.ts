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

		// Main contacts
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
				}
			]
		}),

		// Socials
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
					name: 'youtube',
					title: 'YouTube',
					type: 'url'
				}
			]
		}),

		// SEO Defaults
		defineField({
			name: 'seoDefaults',
			title: 'Default SEO Settings',
			type: 'object',
			fields: [
				defineField({
					name: 'siteTitle',
					title: 'Default Site Title',
					type: 'string',
					validation: (Rule) => Rule.required()
				}),
				defineField({
					name: 'siteDescription',
					title: 'Default Site Description',
					type: 'text',
					validation: (Rule) => Rule.required().max(160)
				}),
				defineField({
					name: 'keywords',
					title: 'Default Keywords',
					type: 'array',
					of: [{ type: 'string' }]
				}),
				defineField({
					name: 'ogImage',
					title: 'Default Social Share Image',
					type: 'image',
					options: {
						hotspot: true
					}
				})
			]
		}),

		// Footer
		defineField({
			name: 'footerText',
			title: 'Footer Text',
			type: 'text',
			rows: 2,
			description: 'Copyright notice or additional footer text'
		}),

		// Analytics & Tracking
		defineField({
			name: 'analytics',
			title: 'Analytics & Tracking',
			type: 'object',
			fields: [
				defineField({
					name: 'gtmId',
					title: 'Google Tag Manager ID',
					type: 'string',
					description: 'Your GTM container ID (e.g., GTM-XXXXXXX)',
					validation: (Rule) =>
						Rule.regex(/^GTM-[A-Z0-9]+$/, {
							name: 'GTM ID format',
							invert: false
						}).warning('GTM ID should be in format GTM-XXXXXXX')
				}),
				defineField({
					name: 'ga4MeasurementId',
					title: 'GA4 Measurement ID (Optional)',
					type: 'string',
					description:
						'Your GA4 Measurement ID (e.g., G-XXXXXXXXXX) - only needed if not using GTM',
					validation: (Rule) =>
						Rule.regex(/^G-[A-Z0-9]+$/, {
							name: 'GA4 ID format',
							invert: false
						}).warning('GA4 ID should be in format G-XXXXXXXXXX')
				})
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
