import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

export type SearchResult = {
	_id: string;
	_type: string;
	title: string;
	excerpt?: string;
	url: string;
	_score: number;
};

const pageTypes = [
	'aboutPage',
	'accessibilityPage',
	'committeePage',
	'contactPage',
	'eventsPage',
	'keyDatesPage',
	'locationsPage',
	'merchandisePage',
	'newsPage',
	'policiesPage',
	'privacyPage',
	'programsPage',
	'sponsorsPage',
	'teamsPage',
	'termsPage'
] as const;

const pageTypeToSlugMap: Record<string, string> = {
	aboutPage: 'about',
	accessibilityPage: 'accessibility',
	committeePage: 'committee',
	contactPage: 'contact',
	eventsPage: 'events',
	keyDatesPage: 'key-dates',
	locationsPage: 'locations',
	merchandisePage: 'merchandise',
	newsPage: 'news',
	policiesPage: 'policies',
	privacyPage: 'privacy',
	programsPage: 'programs',
	sponsorsPage: 'sponsors',
	teamsPage: 'teams',
	termsPage: 'terms'
};

function sanitizeSearchTerm(term: string): string {
	return term.replace(/[*\[\]{}()\\]/g, '\\$&').trim();
}

export async function searchContent(searchTerm: string): Promise<SearchResult[]> {
	const sanitizedTerm = sanitizeSearchTerm(searchTerm);
	const searchQuery = groq`
		*[
			_type in ["newsArticle", "team", "program", ${pageTypes.map((t) => `"${t}"`).join(', ')}]
			&& (
				title match $searchTerm ||
				name match $searchTerm ||
				heading match $searchTerm ||
				excerpt match $searchTerm ||
				pt::text(description) match $searchTerm ||
				pt::text(content) match $searchTerm ||
				pt::text(body) match $searchTerm ||
				pt::text(introduction) match $searchTerm
			)
		] | score(
			boost(title match $searchTerm, 3),
			boost(name match $searchTerm, 3),
			boost(heading match $searchTerm, 3),
			boost(featured == true, 2),
			boost(_type == "newsArticle", 1),
			title match $searchTerm,
			name match $searchTerm,
			heading match $searchTerm,
			excerpt match $searchTerm,
			pt::text(description) match $searchTerm,
			pt::text(content) match $searchTerm,
			pt::text(body) match $searchTerm,
			pt::text(introduction) match $searchTerm
		) | order(_score desc) [0...20] {
			_id,
			_type,
			_score,
			title,
			name,
			heading,
			excerpt,
			"slug": slug.current,
			description,
			content,
			body,
			introduction
		}
	`;

	const results = await client.fetch<
		Array<{
			_id: string;
			_type: string;
			_score: number;
			title?: string;
			name?: string;
			heading?: string;
			excerpt?: string;
			slug?: string;
			description?: unknown;
			content?: unknown;
			body?: unknown;
			introduction?: unknown;
		}>
	>(searchQuery, { searchTerm: sanitizedTerm }, { next: { tags: ['search'] } });

	return results.map((result) => {
		const title = result.title || result.name || result.heading || 'Untitled';
		const url = generateUrl(result._type, result.slug);
		const excerpt = generateExcerpt(result);

		return {
			_id: result._id,
			_type: result._type,
			title,
			excerpt,
			url,
			_score: result._score
		};
	});
}

function generateUrl(type: string, slug?: string): string {
	switch (type) {
		case 'newsArticle':
			return `/news/${slug || ''}`;
		case 'team':
			return `/teams#${slug || ''}`;
		case 'program':
			return `/programs#${slug || ''}`;
		default:
			return `/${pageTypeToSlugMap[type] || slug || ''}`;
	}
}

type PortableTextBlock = {
	_type: string;
	children?: unknown[];
	[key: string]: unknown;
};

type PortableTextSpan = {
	_type: string;
	text?: string;
	[key: string]: unknown;
};

function isPortableTextBlock(value: unknown): value is PortableTextBlock {
	return (
		typeof value === 'object' &&
		value !== null &&
		'_type' in value &&
		value._type === 'block' &&
		(!('children' in value) || Array.isArray(value.children))
	);
}

function isPortableTextSpan(value: unknown): value is PortableTextSpan {
	return (
		typeof value === 'object' &&
		value !== null &&
		'_type' in value &&
		value._type === 'span' &&
		(!('text' in value) || typeof value.text === 'string')
	);
}

function generateExcerpt(result: {
	excerpt?: string;
	description?: unknown;
	introduction?: unknown;
	content?: unknown;
	body?: unknown;
}): string | undefined {
	if (result.excerpt) {
		return result.excerpt;
	}

	const portableTextContent =
		result.description || result.introduction || result.content || result.body;

	if (!Array.isArray(portableTextContent)) {
		return undefined;
	}

	const firstBlock = portableTextContent.find(isPortableTextBlock);

	if (!firstBlock?.children) {
		return undefined;
	}

	const text = firstBlock.children
		.filter(isPortableTextSpan)
		.map((child) => child.text || '')
		.join(' ');

	if (!text) {
		return undefined;
	}

	return text.substring(0, 150) + (text.length > 150 ? '...' : '');
}
