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

export const privacyPage = defineType({
	name: 'privacyPage',
	title: 'Privacy Policy Page',
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
