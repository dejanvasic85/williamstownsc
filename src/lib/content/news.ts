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

export type NewsFilters = {
	limit?: number;
	featured?: boolean | 'exclude';
	imageSize?: 'small' | 'large';
};

const imageSizeConfigValue = {
	small: { width: 800, height: 600 },
	large: { width: 1920, height: 1080 }
};

export async function getNewsArticles(
	filters: NewsFilters = {}
): Promise<TransformedNewsArticle[]> {
	const { limit = 20, featured, imageSize = 'small' } = filters;

	let featuredFilter = '';
	if (featured === true) {
		featuredFilter = ' && featured == true';
	} else if (featured === 'exclude') {
		featuredFilter = ' && featured != true';
	}

	const newsArticlesQuery = `*[_type == "newsArticle" && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())${featuredFilter}] | order(publishedAt desc) [0...$limit] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt,
		featured
	}`;

	const articles = await client.fetch<NewsArticle[]>(
		newsArticlesQuery,
		{ limit },
		{ next: { tags: ['newsArticle'] } }
	);

	const { width, height } = imageSizeConfigValue[imageSize];

	return articles.map(
		(article): TransformedNewsArticle => ({
			_id: article._id,
			title: article.title || '',
			slug: article.slug?.current || '',
			publishedAt: article.publishedAt || '',
			featuredImage: {
				url: article.featuredImage
					? urlFor(article.featuredImage)
							.width(width)
							.height(height)
							.quality(90)
							.format('webp')
							.url()
					: '',
				alt: article.featuredImage?.alt
			},
			excerpt: article.excerpt || '',
			featured: article.featured || false
		})
	);
}

export async function getArticleBySlug(slug: string) {
	const articleBySlugQuery = `*[_type == "newsArticle" && slug.current == $slug && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())][0] {
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
		articleBySlugQuery,
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
				? urlFor(article.featuredImage).width(1920).height(1080).quality(90).format('webp').url()
				: '',
			alt: article.featuredImage?.alt
		},
		excerpt: article.excerpt || '',
		content: article.content,
		featured: article.featured || false
	};
}

export async function getAllArticlesForSitemap() {
	const allArticlesQuery = groq`*[_type == "newsArticle" && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())] | order(publishedAt desc) {
		slug,
		publishedAt
	}`;

	const articles = await client.fetch<Array<{ slug: { current: string }; publishedAt: string }>>(
		allArticlesQuery,
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

type FeedArticleQueryResult = Omit<NewsArticle, 'featuredImage'> & {
	featuredImage?: {
		alt?: string;
		asset?: {
			extension?: string;
			mimeType?: string;
		};
	};
};

export async function getAllArticlesForFeed() {
	const feedArticlesQuery = groq`*[_type == "newsArticle" && publishedAt <= now() && (!defined(expiryDate) || expiryDate > now())] | order(publishedAt desc) [0...50] {
		_id,
		title,
		slug,
		publishedAt,
		excerpt,
		featuredImage {
			...,
			asset-> {
				extension,
				mimeType
			}
		}
	}`;

	const articles = await client.fetch<FeedArticleQueryResult[]>(
		feedArticlesQuery,
		{},
		{ next: { tags: ['newsArticle'] } }
	);

	return articles
		.filter((article) => article.slug?.current)
		.map((article) => ({
			_id: article._id,
			title: article.title || '',
			slug: article.slug!.current,
			publishedAt: article.publishedAt || '',
			excerpt: article.excerpt || '',
			featuredImage: article.featuredImage
				? {
						url: urlFor(article.featuredImage).width(1200).height(630).url(),
						alt: article.featuredImage?.alt,
						mimeType: article.featuredImage.asset?.mimeType
					}
				: undefined
		}));
}
