import { defineType } from 'sanity';
import {
	bodyField,
	introductionField,
	pageHeadingField,
	publishedAtField,
	publishedField,
	seoField
} from '../fields/commonFields';

export const policiesPage = defineType({
	name: 'policiesPage',
	title: 'Policies & Regulations Page',
	type: 'document',
	fields: [
		pageHeadingField,
		introductionField,
		bodyField,
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
