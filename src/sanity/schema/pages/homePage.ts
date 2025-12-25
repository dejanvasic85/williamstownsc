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

export const homePage = defineType({
	name: 'homePage',
	title: 'Home Page',
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
