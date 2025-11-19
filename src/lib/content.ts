import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { NewsArticle, Program, SiteSettings } from '@/sanity/sanity.types';

export interface TransformedNewsArticle {
	_id: string;
	title: string;
	slug: string;
	publishedAt: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
	excerpt: string;
	featured?: boolean;
}

export interface TransformedProgram {
	_id: string;
	name: string;
	slug: string;
	startDate: string;
	endDate: string;
	minAge: number;
	maxAge: number;
	image?: {
		url: string;
		alt?: string;
	};
	description?: string;
}

export async function getSiteSettings() {
	const siteSettings = await client.fetch<SiteSettings>(
		`*[_type == "siteSettings"][0]{
			_id,
			clubName,
			tagline,
			description,
			logo,
			locations,
			contact,
			seoDefaults,
			socials,
			seoDefaults,
			footerText,
			analytics
		}`
	);

	return siteSettings;
}

export async function getFeaturedArticles(): Promise<TransformedNewsArticle[]> {
	const query = `*[_type == "newsArticle" && featured == true] | order(publishedAt desc) [0...3] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt
	}`;

	const articles = await client.fetch<NewsArticle[]>(query);

	return articles.map(
		(article): TransformedNewsArticle => ({
			_id: article._id,
			title: article.title || '',
			slug: article.slug?.current || '',
			publishedAt: article.publishedAt || '',
			featuredImage: {
				url: article.featuredImage
					? urlFor(article.featuredImage).width(1920).height(1080).url()
					: '',
				alt: article.featuredImage?.alt
			},
			excerpt: article.excerpt || ''
		})
	);
}

export async function getLatestArticles(limit: number = 3): Promise<TransformedNewsArticle[]> {
	const query = `*[_type == "newsArticle" && featured != true] | order(publishedAt desc) [0...${limit}] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt
	}`;

	const articles = await client.fetch<NewsArticle[]>(query);

	return articles.map(
		(article): TransformedNewsArticle => ({
			_id: article._id,
			title: article.title || '',
			slug: article.slug?.current || '',
			publishedAt: article.publishedAt || '',
			featuredImage: {
				url: article.featuredImage
					? urlFor(article.featuredImage).width(800).height(600).url()
					: '',
				alt: article.featuredImage?.alt
			},
			excerpt: article.excerpt || ''
		})
	);
}

export async function getAllArticles(limit: number = 20): Promise<TransformedNewsArticle[]> {
	const query = `*[_type == "newsArticle"] | order(publishedAt desc) [0...${limit}] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt,
		featured
	}`;

	const articles = await client.fetch<NewsArticle[]>(query);

	return articles.map(
		(article): TransformedNewsArticle => ({
			_id: article._id,
			title: article.title || '',
			slug: article.slug?.current || '',
			publishedAt: article.publishedAt || '',
			featuredImage: {
				url: article.featuredImage
					? urlFor(article.featuredImage).width(800).height(600).url()
					: '',
				alt: article.featuredImage?.alt
			},
			excerpt: article.excerpt || '',
			featured: article.featured || false
		})
	);
}

export async function getArticleBySlug(slug: string) {
	const query = `*[_type == "newsArticle" && slug.current == $slug][0] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt,
		content,
		featured
	}`;

	const article = await client.fetch<NewsArticle>(query, { slug });

	if (!article) {
		return null;
	}

	return {
		_id: article._id,
		title: article.title || '',
		slug: article.slug?.current || '',
		publishedAt: article.publishedAt || '',
		featuredImage: {
			url: article.featuredImage
				? urlFor(article.featuredImage).width(1920).height(1080).url()
				: '',
			alt: article.featuredImage?.alt
		},
		excerpt: article.excerpt || '',
		content: article.content,
		featured: article.featured || false
	};
}

export async function getActivePrograms(): Promise<TransformedProgram[]> {
	const query = `*[_type == "program" && active == true] | order(startDate desc) {
		_id,
		name,
		slug,
		startDate,
		endDate,
		minAge,
		maxAge,
		image,
		description
	}`;

	const programs = await client.fetch<Program[]>(query);

	return programs.map(
		(program): TransformedProgram => ({
			_id: program._id,
			name: program.name || '',
			slug: program.slug?.current || '',
			startDate: program.startDate || '',
			endDate: program.endDate || '',
			minAge: program.minAge || 0,
			maxAge: program.maxAge || 0,
			image: program.image
				? {
						url: urlFor(program.image).width(800).height(600).url(),
						alt: program.image.alt
					}
				: undefined,
			description: program.description
		})
	);
}
