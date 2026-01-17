import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { NewsCard, NewsHero } from '@/components/news';
import { getNewsArticles } from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('newsPage');
}

export default async function NewsPage() {
	const articles = await getNewsArticles({ limit: 20 });

	const heroArticle = articles[0];
	const gridArticles = articles.slice(1);

	return (
		<PageContainer
			heading="News & Matches"
			intro="Stay up to date with the latest news, match reports, and updates from Williamstown SC"
		>
			{articles.length > 0 && (
				<>
					{heroArticle && (
						<NewsHero
							key={heroArticle._id}
							slug={heroArticle.slug}
							title={heroArticle.title}
							excerpt={heroArticle.excerpt}
							publishedAt={heroArticle.publishedAt}
							featuredImage={heroArticle.featuredImage}
						/>
					)}

					{gridArticles.length > 0 && (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{gridArticles.map((article) => (
								<NewsCard
									key={article._id}
									slug={article.slug}
									title={article.title}
									excerpt={article.excerpt}
									publishedAt={article.publishedAt}
									featuredImage={article.featuredImage}
									featured={article.featured}
								/>
							))}
						</div>
					)}
				</>
			)}

			{articles.length === 0 && (
				<div className="py-24 text-center">
					<h2 className="text-base-content/70 mb-4 text-2xl font-bold">No articles yet</h2>
					<p className="text-base-content/60">Check back soon for the latest news and updates</p>
				</div>
			)}
		</PageContainer>
	);
}
