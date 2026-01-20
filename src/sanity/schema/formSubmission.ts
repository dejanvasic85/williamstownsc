import { defineField, defineType } from 'sanity';

export const formSubmission = defineType({
	name: 'formSubmission',
	title: 'Form Submission',
	type: 'document',
	fields: [
		defineField({
			name: 'contactType',
			title: 'Contact Type',
			type: 'string',
			readOnly: true,
			options: {
				list: [
					{ title: 'Player Registration', value: 'player' },
					{ title: 'Coaching Enquiry', value: 'coach' },
					{ title: 'Sponsorship Enquiry', value: 'sponsor' },
					{ title: 'Program Registration', value: 'program' },
					{ title: 'General Enquiry', value: 'general' }
				],
				layout: 'dropdown'
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'submittedAt',
			title: 'Submitted At',
			type: 'datetime',
			readOnly: true,
			validation: (Rule) => Rule.required(),
			initialValue: () => new Date().toISOString()
		}),
		defineField({
			name: 'status',
			title: 'Status',
			type: 'string',
			options: {
				list: [
					{ title: 'New', value: 'new' },
					{ title: 'Reviewed', value: 'reviewed' },
					{ title: 'Archived', value: 'archived' }
				],
				layout: 'radio'
			},
			initialValue: 'new',
			validation: (Rule) => Rule.required()
		}),

		// Common fields
		defineField({
			name: 'name',
			title: 'Name',
			type: 'string',
			readOnly: true,
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'email',
			title: 'Email',
			type: 'string',
			readOnly: true,
			validation: (Rule) => Rule.required().email()
		}),
		defineField({
			name: 'phone',
			title: 'Phone',
			type: 'string',
			readOnly: true
		}),
		defineField({
			name: 'message',
			title: 'Message',
			type: 'text',
			readOnly: true,
			rows: 5,
			validation: (Rule) => Rule.required()
		}),

		// Player-specific fields
		defineField({
			name: 'ageGroup',
			title: 'Age Group',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'player'
		}),
		defineField({
			name: 'experience',
			title: 'Experience',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'player'
		}),
		defineField({
			name: 'position',
			title: 'Position',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'player'
		}),

		// Coach-specific fields
		defineField({
			name: 'qualifications',
			title: 'Qualifications',
			type: 'text',
			readOnly: true,
			rows: 3,
			hidden: ({ document }) => document?.contactType !== 'coach'
		}),
		defineField({
			name: 'coachExperience',
			title: 'Coaching Experience',
			type: 'text',
			readOnly: true,
			rows: 3,
			hidden: ({ document }) => document?.contactType !== 'coach'
		}),
		defineField({
			name: 'ageGroupsInterest',
			title: 'Age Groups of Interest',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'coach'
		}),

		// Sponsor-specific fields
		defineField({
			name: 'organization',
			title: 'Organization',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'sponsor'
		}),
		defineField({
			name: 'sponsorshipTier',
			title: 'Sponsorship Tier Interest',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'sponsor'
		}),

		// Program-specific fields
		defineField({
			name: 'programId',
			title: 'Program ID',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'program'
		}),

		// General-specific fields
		defineField({
			name: 'subject',
			title: 'Subject',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => document?.contactType !== 'general'
		}),

		// Metadata fields
		defineField({
			name: 'metadata',
			title: 'Metadata',
			type: 'object',
			readOnly: true,
			fields: [
				{
					name: 'userAgent',
					title: 'User Agent',
					type: 'string',
					readOnly: true
				},
				{
					name: 'ipAddress',
					title: 'IP Address',
					type: 'string',
					readOnly: true
				}
			],
			options: {
				collapsible: true,
				collapsed: true
			}
		}),

		// Admin notes
		defineField({
			name: 'notes',
			title: 'Admin Notes',
			type: 'text',
			rows: 3,
			description: 'Internal notes for staff follow-up'
		})
	],
	preview: {
		select: {
			name: 'name',
			email: 'email',
			contactType: 'contactType',
			submittedAt: 'submittedAt',
			status: 'status'
		},
		prepare({ name, email, contactType, submittedAt, status }) {
			const typeLabels: Record<string, string> = {
				player: '⚽ Player',
				coach: '👨‍🏫 Coach',
				sponsor: '💼 Sponsor',
				program: '📋 Program',
				general: '💬 General'
			};

			const statusIcons: Record<string, string> = {
				new: '🆕',
				reviewed: '✅',
				archived: '📦'
			};

			const date = submittedAt ? new Date(submittedAt).toLocaleDateString() : 'Unknown date';
			const statusIcon = statusIcons[status] || '';

			return {
				title: `${name} (${email})`,
				subtitle: `${typeLabels[contactType] || contactType} | ${date} ${statusIcon}`,
				media: undefined
			};
		}
	},
	orderings: [
		{
			title: 'Newest First',
			name: 'newestFirst',
			by: [{ field: 'submittedAt', direction: 'desc' }]
		},
		{
			title: 'Oldest First',
			name: 'oldestFirst',
			by: [{ field: 'submittedAt', direction: 'asc' }]
		},
		{
			title: 'Name A-Z',
			name: 'nameAsc',
			by: [{ field: 'name', direction: 'asc' }]
		}
	]
});
