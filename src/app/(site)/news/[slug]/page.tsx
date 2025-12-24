import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PortableText } from 'next-sanity';
import { PageContainer } from '@/components/layout';
import { getArticleBySlug, getSiteSettings } from '@/lib/content';
import { buildUrl, getRequestBaseUrl } from '@/lib/url';
import { urlFor } from '@/sanity/lib/image';

interface ArticlePageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
	const { slug } = await params;
	const article = await getArticleBySlug(slug);
	const siteSettings = await getSiteSettings();

	if (!article) {
		notFound();
	}

	if (!siteSettings.canonicalUrl) {
		throw new Error('canonicalUrl is required');
	}

	const articleCanonicalUrl = buildUrl(siteSettings.canonicalUrl, 'news', article.slug);
	const requestBaseUrl = await getRequestBaseUrl();
	const articleRequestUrl = buildUrl(requestBaseUrl, 'news', article.slug);

	return {
		title: article.title,
		description: article.excerpt,
		alternates: {
			canonical: articleCanonicalUrl
		},
		openGraph: {
			type: 'article',
			siteName: siteSettings.clubName,
			title: article.title,
			description: article.excerpt,
			url: articleRequestUrl,
			publishedTime: article.publishedAt,
			images: [
				{
					url: article.featuredImage.url,
					width: 1920,
					height: 1080,
					alt: article.featuredImage.alt || article.title
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title: article.title,
			description: article.excerpt,
			images: [article.featuredImage.url]
		}
	};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
	const { slug } = await params;
	const article = await getArticleBySlug(slug);
	const siteSettings = await getSiteSettings();

	if (!article) {
		notFound();
	}

	if (!siteSettings.canonicalUrl) {
		throw new Error('canonicalUrl is required');
	}

	const publishedDate = new Date(article.publishedAt);
	const formattedDate = publishedDate.toLocaleDateString('en-AU', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'NewsArticle',
		headline: article.title,
		description: article.excerpt,
		image: article.featuredImage.url,
		datePublished: article.publishedAt,
		dateModified: article.publishedAt,
		author: {
			'@type': 'Organization',
			name: siteSettings.clubName
		},
		publisher: {
			'@type': 'Organization',
			name: siteSettings.clubName,
			logo: {
				'@type': 'ImageObject',
				url: buildUrl(siteSettings.canonicalUrl, 'logo.png')
			}
		}
	};

	return (
		<PageContainer layout="article">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<article>
				<div className="mb-8">
					<h1 className="mb-4 text-3xl font-bold lg:text-4xl">{article.title}</h1>
					<time dateTime={publishedDate.toISOString()} className="text-base-content/60 text-lg">
						{formattedDate}
					</time>
				</div>

				{article.featuredImage.url && (
					<figure className="mb-8 overflow-hidden rounded-lg">
						<Image
							src={article.featuredImage.url}
							alt={article.featuredImage.alt || article.title}
							width={1920}
							height={1080}
							className="h-auto w-full object-cover"
							priority
						/>
					</figure>
				)}

				{article.content && (
					<div className="prose prose-lg max-w-none">
						<PortableText
							value={article.content}
							components={{
								types: {
									image: ({ value }) => {
										const imageUrl = value.asset ? urlFor(value.asset).width(1200).url() : '';
										return (
											<figure className="my-8">
												{imageUrl && (
													<Image
														src={imageUrl}
														alt={value.alt || ''}
														width={1200}
														height={800}
														className="h-auto w-full rounded-lg"
													/>
												)}
												{value.caption && (
													<figcaption className="text-base-content/60 mt-2 text-center text-sm">
														{value.caption}
													</figcaption>
												)}
											</figure>
										);
									}
								},
								block: {
									h1: ({ children }) => (
										<h1 className="mt-8 mb-4 text-3xl font-bold">{children}</h1>
									),
									h2: ({ children }) => (
										<h2 className="mt-8 mb-4 text-2xl font-bold">{children}</h2>
									),
									h3: ({ children }) => <h3 className="mt-6 mb-3 text-xl font-bold">{children}</h3>,
									h4: ({ children }) => <h4 className="mt-6 mb-3 text-lg font-bold">{children}</h4>,
									normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
									blockquote: ({ children }) => (
										<blockquote className="border-secondary my-6 border-l-4 pl-4 italic">
											{children}
										</blockquote>
									)
								},
								list: {
									bullet: ({ children }) => (
										<ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
									),
									number: ({ children }) => (
										<ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
									)
								},
								listItem: {
									bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
									number: ({ children }) => <li className="leading-relaxed">{children}</li>
								},
								marks: {
									strong: ({ children }) => <strong className="font-bold">{children}</strong>,
									em: ({ children }) => <em className="italic">{children}</em>,
									link: ({ value, children }) => {
										const target = value?.href?.startsWith('http') ? '_blank' : undefined;
										const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
										return (
											<a
												href={value?.href}
												target={target}
												rel={rel}
												className="text-secondary font-medium hover:underline"
											>
												{children}
											</a>
										);
									}
								}
							}}
						/>
					</div>
				)}
			</article>
		</PageContainer>
	);
}
