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
						},
						{
							name: 'mapEmbedUrl',
							title: 'Map Embed URL',
							type: 'url',
							description: 'Google Maps embed URL (Get from Share → Embed a map)'
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

		// Contact form email recipients
		defineField({
			name: 'contactEmails',
			title: 'Contact Form Email Recipients',
			type: 'object',
			description: 'Email addresses where contact form submissions will be sent',
			fields: [
				{
					name: 'from',
					title: 'From Email Address',
					type: 'string',
					description: 'SES verified sender email address (e.g., noreply@williamstownsc.com)',
					validation: (Rule) => Rule.required().email()
				},
				{
					name: 'player',
					title: 'Player Enquiries',
					type: 'string',
					description: 'Email address for player registration enquiries',
					validation: (Rule) => Rule.email()
				},
				{
					name: 'coach',
					title: 'Coach Enquiries',
					type: 'string',
					description: 'Email address for coaching enquiries',
					validation: (Rule) => Rule.email()
				},
				{
					name: 'sponsor',
					title: 'Sponsor Enquiries',
					type: 'string',
					description: 'Email address for sponsorship enquiries',
					validation: (Rule) => Rule.email()
				},
				{
					name: 'program',
					title: 'Program Enquiries',
					type: 'string',
					description: 'Email address for program registration enquiries',
					validation: (Rule) => Rule.email()
				},
				{
					name: 'general',
					title: 'General Enquiries',
					type: 'string',
					description: 'Email address for general enquiries',
					validation: (Rule) => Rule.required().email()
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
					description: 'Shown in browser tabs and search results',
					validation: (Rule) => Rule.required()
				}),
				defineField({
					name: 'titleSuffix',
					title: 'Title Suffix',
					type: 'string',
					description:
						'Added to all page titles (e.g., "About | Williamstown SC"). Defaults to club name if not set.',
					placeholder: 'Williamstown SC'
				}),
				defineField({
					name: 'siteDescription',
					title: 'Default Site Description',
					type: 'text',
					description:
						'Brief description shown in search results and social media previews. Keep under 160 characters.',
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
					description:
						'Image shown when sharing your site on social media (Facebook, Twitter, LinkedIn, etc.). Recommended size: 1200×630px. Should include your club logo, name, and brand colors for recognition.',
					options: {
						hotspot: true
					}
				})
			]
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
		}),

		// Website URL for canonical
		defineField({
			name: 'canonicalUrl',
			title: 'Canonical URL',
			type: 'url',
			description: 'The canonical URL of your site used for SEO and social sharing',
			placeholder: 'https://www.williamstownsc.com/',
			validation: (Rule) =>
				Rule.uri({
					scheme: ['https']
				}).required()
		})
	],
	preview: {
		select: {
			title: 'clubName',
			subtitle: 'tagline'
		}
	}
});
