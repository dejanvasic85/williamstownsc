import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { NewsCard } from '@/components/news';
import { getAllArticles } from '@/lib/content';
import { generateStaticMetadata } from '@/lib/metadata/staticMetadata';

export async function generateMetadata(): Promise<Metadata> {
	return generateStaticMetadata({
		title: 'News & Matches',
		description:
			'Stay up to date with the latest news, match reports, and updates from Williamstown Soccer Club.'
	});
}

export default async function NewsPage() {
	const articles = await getAllArticles(20);

	return (
		<PageContainer
			heading="News & Matches"
			intro="Stay up to date with the latest news, match reports, and updates from Williamstown SC"
		>
			{articles.length > 0 && (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => (
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

			{articles.length === 0 && (
				<div className="py-24 text-center">
					<h2 className="text-base-content/70 mb-4 text-2xl font-bold">No articles yet</h2>
					<p className="text-base-content/60">Check back soon for the latest news and updates</p>
				</div>
			)}
		</PageContainer>
	);
}
