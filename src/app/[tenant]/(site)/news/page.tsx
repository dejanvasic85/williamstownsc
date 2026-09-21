import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { NewsCard, NewsHero } from '@/components/news';
import { getNewsArticles } from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('newsPage');
}

export default async function NewsPage() {
	const [articles, featuredPool] = await Promise.all([
		getNewsArticles({ limit: 20 }),
		getNewsArticles({ limit: 6, featured: true })
	]);

	const heroArticle = articles[0];
	const primaryFeaturedArticles = featuredPool
		.filter((article) => article._id !== heroArticle?._id)
		.slice(0, 2);
	const primaryFeaturedIds = new Set(primaryFeaturedArticles.map((article) => article._id));
	const fallbackFeaturedArticles = articles
		.slice(1)
		.filter((article) => !article.featured && !primaryFeaturedIds.has(article._id))
		.slice(0, Math.max(0, 2 - primaryFeaturedArticles.length));
	const featuredArticles = [...primaryFeaturedArticles, ...fallbackFeaturedArticles];
	const featuredIds = new Set(featuredArticles.map((article) => article._id));
	const gridArticles = articles.slice(1).filter((article) => !featuredIds.has(article._id));
	const featuredSectionTitle =
		fallbackFeaturedArticles.length > 0 ? 'Top Updates' : 'Featured Updates';

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

					{featuredArticles.length > 0 && (
						<section className="mb-14">
							<div className="mb-6 flex items-center gap-4">
								<h2 className="text-2xl font-bold">{featuredSectionTitle}</h2>
								<div className="bg-secondary h-0.5 flex-1 rounded-full" />
							</div>
							<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
								{featuredArticles.map((article) => (
									<div key={article._id} className="animate-fade-in-up">
										<NewsCard
											slug={article.slug}
											title={article.title}
											excerpt={article.excerpt}
											publishedAt={article.publishedAt}
											featuredImage={article.featuredImage}
											featured
											size="large"
										/>
									</div>
								))}
							</div>
						</section>
					)}

					{gridArticles.length > 0 && (
						<section>
							<div className="mb-6 flex items-center gap-4">
								<h2 className="text-2xl font-bold">Latest News</h2>
								<div className="bg-base-300 h-px flex-1" />
							</div>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
								{gridArticles.map((article, index) => (
									<div
										key={article._id}
										className="animate-fade-in-up"
										style={{ animationDelay: `${Math.min(index * 80, 500)}ms` }}
									>
										<NewsCard
											slug={article.slug}
											title={article.title}
											excerpt={article.excerpt}
											publishedAt={article.publishedAt}
											featuredImage={article.featuredImage}
											featured={article.featured}
										/>
									</div>
								))}
							</div>
						</section>
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
