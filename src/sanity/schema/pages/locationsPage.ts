import { defineType } from 'sanity';
import {
	bodyFieldNoImages,
	introductionField,
	pageHeadingField,
	publishedAtField,
	publishedField,
	seoField
} from '../fields/commonFields';

export const locationsPage = defineType({
	name: 'locationsPage',
	title: 'Locations Page',
	type: 'document',
	fields: [
		pageHeadingField,
		introductionField,
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
