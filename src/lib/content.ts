import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { NewsArticle, SiteSettings } from '@/sanity/sanity.types';

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

export async function getFeaturedArticles() {
	const query = `*[_type == "newsArticle" && featured == true] | order(publishedAt desc) [0...3] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt
	}`;

	const articles = await client.fetch<NewsArticle[]>(query);

	return articles.map((article) => ({
		_id: article._id,
		title: article.title || '',
		slug: { current: article.slug?.current || '' },
		publishedAt: article.publishedAt || '',
		featuredImage: {
			url: article.featuredImage
				? urlFor(article.featuredImage).width(1920).height(1080).url()
				: '',
			alt: article.featuredImage?.alt
		},
		excerpt: article.excerpt || ''
	}));
}

export async function getLatestArticles(limit: number = 3) {
	const query = `*[_type == "newsArticle" && featured != true] | order(publishedAt desc) [0...${limit}] {
		_id,
		title,
		slug,
		publishedAt,
		featuredImage,
		excerpt
	}`;

	const articles = await client.fetch<NewsArticle[]>(query);

	return articles.map((article) => ({
		_id: article._id,
		title: article.title || '',
		slug: article.slug?.current || '',
		publishedAt: article.publishedAt || '',
		featuredImage: {
			url: article.featuredImage ? urlFor(article.featuredImage).width(800).height(600).url() : '',
			alt: article.featuredImage?.alt
		},
		excerpt: article.excerpt || ''
	}));
}
