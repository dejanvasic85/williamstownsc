import { defineType } from 'sanity';
import {
	bodyFieldNoImages,
	introductionField,
	pageHeadingField,
	publishedAtField,
	publishedField,
	seoField
} from '../fields/commonFields';

export const contactPage = defineType({
	name: 'contactPage',
	title: 'Contact Page',
	type: 'document',
	fields: [
		pageHeadingField,
		introductionField,
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
		},
		bodyFieldNoImages,
		seoField,
		publishedField,
		publishedAtField
	],
	preview: {
		select: {
			title: 'heading'
		}
	}
});
