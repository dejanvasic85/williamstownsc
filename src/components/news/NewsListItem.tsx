import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NewsListItemProps {
	slug: string;
	title: string;
	publishedAt: string;
}

export function NewsListItem({ slug, title, publishedAt }: NewsListItemProps) {
	const publishedDate = new Date(publishedAt);
	const formattedDate = publishedDate.toLocaleDateString('en-AU', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const relativeDate = formatDistanceToNow(publishedDate, { addSuffix: true });

	return (
		<Link
			href={`/news/${slug}`}
			className="group block border-base-300 border-b py-4 transition-colors hover:bg-base-200/50"
		>
			<div className="flex flex-col gap-1">
				<time
					dateTime={publishedDate.toISOString()}
					title={relativeDate}
					className="text-base-content/60 text-sm"
				>
					{formattedDate}
				</time>
				<h3 className="text-base-content font-medium transition-colors group-hover:text-primary">
					{title}
				</h3>
			</div>
		</Link>
	);
}
