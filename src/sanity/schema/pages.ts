import type { FieldDefinition } from 'sanity';
import { defineType } from 'sanity';
import {
	bodyField,
	featuredImageField,
	introductionField,
	pageHeadingField,
	seoField
} from './fields/commonFields';

type PageOptions = {
	additionalFields?: FieldDefinition[];
};

/**
 * Creates a page with full content editing capabilities (heading, intro, body, images)
 * Use for content-rich pages like About, Contact, News, etc.
 */
function createEditablePage(name: string, title: string, options?: PageOptions) {
	return defineType({
		name,
		title,
		type: 'document',
		fields: [
			pageHeadingField,
			introductionField,
			...(options?.additionalFields || []),
			bodyField,
			featuredImageField,
			seoField
		],
		preview: {
			select: {
				title: 'heading',
				media: 'featuredImage'
			}
		}
	});
}

/**
 * Creates a page with SEO-only fields (no heading or body content)
 * Use for pages where content is hardcoded in the app (e.g., Homepage)
 */
function createPage(name: string, title: string, options?: PageOptions) {
	return defineType({
		name,
		title,
		type: 'document',
		fields: [...(options?.additionalFields || []), seoField],
		preview: {
			prepare() {
				return {
					title
				};
			}
		}
	});
}

// SEO-only pages (content is hardcoded in app)
export const homePage = createPage('homePage', 'Home Page', {
	additionalFields: [
		{
			name: 'keyDatesSection',
			title: 'Key Dates Section',
			type: 'object',
			description: 'Configuration for the key dates section on the homepage',
			fields: [
				{
					name: 'heading',
					title: 'Heading',
					type: 'string',
					description: 'Section heading (e.g., "Key Dates 2026")'
				},
				{
					name: 'leadingText',
					title: 'Leading Text',
					type: 'string',
					description: 'Brief description shown below the heading'
				}
			]
		}
	]
});

// Editable content pages
export const aboutPage = createEditablePage('aboutPage', 'About Page');
export const keyDatesPage = createEditablePage('keyDatesPage', 'Key Dates Page', {
	additionalFields: [
		{
			name: 'keyDates',
			title: 'Key Dates',
			type: 'array',
			of: [{ type: 'keyDateItem' }],
			description: 'List of important dates for the season'
		}
	]
});
export const accessibilityPage = createEditablePage('accessibilityPage', 'Accessibility Statement');
export const committeePage = createEditablePage('committeePage', 'Committee Page', {
	additionalFields: [
		{
			name: 'committeeMembers',
			title: 'Committee Members',
			type: 'array',
			of: [{ type: 'committeeMember' }],
			description: 'List of committee members'
		}
	]
});
export const locationsPage = createEditablePage('locationsPage', 'Locations Page');
export const merchandisePage = createEditablePage('merchandisePage', 'Merchandise Page');
export const newsPage = createEditablePage('newsPage', 'News Page');
export const policiesPage = createEditablePage('policiesPage', 'Policies & Regulations Page');
export const privacyPage = createEditablePage('privacyPage', 'Privacy Policy');
export const programsPage = createEditablePage('programsPage', 'Programs Page');
export const sponsorsPage = createEditablePage('sponsorsPage', 'Sponsors Page');
export const teamsPage = createEditablePage('teamsPage', 'Teams Page');
export const termsPage = createEditablePage('termsPage', 'Terms of Service');

// Pages with custom fields
export const contactPage = createEditablePage('contactPage', 'Contact Page', {
	additionalFields: [
		{
			name: 'playerContent',
			title: 'Player EOI',
			type: 'contactTypeContent',
			description: 'Content for players wanting to join a team'
		},
		{
			name: 'coachContent',
			title: 'Coach EOI',
			type: 'contactTypeContent',
			description: 'Content for potential coaches'
		},
		{
			name: 'sponsorContent',
			title: 'Sponsor EOI',
			type: 'contactTypeContent',
			description: 'Content for business partnerships'
		},
		{
			name: 'programContent',
			title: 'Program EOI',
			type: 'contactTypeContent',
			description: 'Content for skills programs and clinics'
		},
		{
			name: 'generalContent',
			title: 'General Enquiry',
			type: 'contactTypeContent',
			description: 'Content for general questions'
		}
	]
});
