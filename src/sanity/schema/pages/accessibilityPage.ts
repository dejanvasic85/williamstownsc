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

export const accessibilityPage = defineType({
	name: 'accessibilityPage',
	title: 'Accessibility Statement Page',
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
