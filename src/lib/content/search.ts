import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { contentTypeRoutes } from '@/lib/routes';

export type SearchResult = {
	_id: string;
	_type: string;
	title: string;
	excerpt?: string;
	url: string;
	_score: number;
};

function sanitizeSearchTerm(term: string): string {
	return term.replace(/[*\[\]{}()\\]/g, '\\$&').trim();
}

export async function searchContent(searchTerm: string): Promise<SearchResult[]> {
	const sanitizedTerm = sanitizeSearchTerm(searchTerm);
	const searchQuery = groq`
		*[
			_type in ["newsArticle", "team", "program", "aboutPage", "accessibilityPage", "committeePage", "contactPage", "keyDatesPage", "locationsPage", "merchandisePage", "newsPage", "policiesPage", "privacyPage", "programsPage", "sponsorsPage", "teamsPage", "termsPage"]
			&& (_type != "newsArticle" || (publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())))
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
	const routeFunc = contentTypeRoutes[type];
	if (routeFunc) {
		return routeFunc(slug);
	}
	return `/${slug || ''}`;
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
