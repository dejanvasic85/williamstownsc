import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { NewsArticle } from '@/sanity/sanity.types';

export type TransformedNewsArticle = Pick<NewsArticle, '_id' | 'featured'> & {
	title: string;
	slug: string;
	publishedAt: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
	excerpt: string;
};

const CAROUSEL_ARTICLE_LIMIT = 10;

export async function getCarouselArticles(): Promise<TransformedNewsArticle[]> {
	const query = `*[_type == "newsArticle" && featured == true && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())] | order(publishedAt desc) [0...${CAROUSEL_ARTICLE_LIMIT}] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt,
		featured
	}`;

	const articles = await client.fetch<NewsArticle[]>(
		query,
		{},
		{ next: { tags: ['newsArticle'] } }
	);

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
			excerpt: article.excerpt || '',
			featured: article.featured || false
		})
	);
}

export async function getLatestArticles(limit: number = 3): Promise<TransformedNewsArticle[]> {
	const query = `*[_type == "newsArticle" && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())] | order(publishedAt desc) [0...${limit}] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt,
		featured
	}`;

	const articles = await client.fetch<NewsArticle[]>(
		query,
		{},
		{ next: { tags: ['newsArticle'] } }
	);

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

export async function getAllArticles(limit: number = 20): Promise<TransformedNewsArticle[]> {
	const query = `*[_type == "newsArticle" && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())] | order(publishedAt desc) [0...${limit}] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt,
		featured
	}`;

	const articles = await client.fetch<NewsArticle[]>(
		query,
		{},
		{ next: { tags: ['newsArticle'] } }
	);

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
	const query = `*[_type == "newsArticle" && slug.current == $slug && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())][0] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt,
		content,
		featured
	}`;

	const article = await client.fetch<NewsArticle>(
		query,
		{ slug },
		{ next: { tags: ['newsArticle'] } }
	);

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

export async function getAllArticlesForSitemap() {
	const query = groq`*[_type == "newsArticle" && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())] | order(publishedAt desc) {
		slug,
		publishedAt
	}`;

	const articles = await client.fetch<Array<{ slug: { current: string }; publishedAt: string }>>(
		query,
		{},
		{ next: { tags: ['newsArticle'] } }
	);

	return articles
		.filter((article) => article.slug?.current)
		.map((article) => ({
			slug: article.slug.current,
			publishedAt: article.publishedAt || ''
		}));
}
