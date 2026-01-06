import Link from 'next/link';
import { NewsListItem } from '@/components/news';

interface NewsArticle {
	_id: string;
	slug: string;
	title: string;
	publishedAt: string;
}

interface NewsPanelProps {
	articles: NewsArticle[];
}

export function NewsPanel({ articles }: NewsPanelProps) {
	if (articles.length === 0) {
		return null;
	}

	return (
		<div className="lg:w-1/3">
			<div className="card h-full">
				<div className="card-body p-0">
					<h2 className="card-title px-6 text-2xl">News</h2>
					<div className="px-6">
						{articles.map((article) => (
							<NewsListItem
								key={article._id}
								slug={article.slug}
								title={article.title}
								publishedAt={article.publishedAt}
							/>
						))}
					</div>
					<div className="flex justify-center px-6 pt-2 pb-4 md:justify-end">
						<Link href="/news" className="btn btn-primary btn-outline">
							View all news
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
