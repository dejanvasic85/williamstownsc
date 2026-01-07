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
		<Link href={`/news/${slug}`} className="group block py-4 hover:underline">
			<div className="flex flex-col gap-1">
				<time
					dateTime={publishedDate.toISOString()}
					title={relativeDate}
					className="text-base-content/60"
				>
					{formattedDate}
				</time>
				<h3 className="text-base-content font-medium">{title}</h3>
			</div>
		</Link>
	);
}
