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

export const newsPage = defineType({
	name: 'newsPage',
	title: 'News Page',
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
