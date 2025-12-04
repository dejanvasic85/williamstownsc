import { defineType } from 'sanity';
import {
	bodyFieldNoImages,
	introductionField,
	lastUpdatedField,
	pageHeadingField,
	publishedAtField,
	publishedField,
	seoField
} from '../fields/commonFields';

export const termsPage = defineType({
	name: 'termsPage',
	title: 'Terms of Service Page',
	type: 'document',
	fields: [
		pageHeadingField,
		introductionField,
		bodyFieldNoImages,
		lastUpdatedField,
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
