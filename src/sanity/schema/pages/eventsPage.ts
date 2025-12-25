import { defineType } from 'sanity';
import {
	bodyField,
	featuredImageField,
	introductionField,
	pageHeadingField,
	publishedAtField,
	publishedField,
	seoField
} from '../fields/commonFields';

export const eventsPage = defineType({
	name: 'eventsPage',
	title: 'Events Page',
	type: 'document',
	fields: [
		pageHeadingField,
		introductionField,
		bodyField,
		featuredImageField,
		seoField,
		publishedField,
		publishedAtField
	],
	preview: {
		select: {
			title: 'heading',
			media: 'featuredImage'
		}
	}
});
