import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
}

export function NewsCard({ slug, title, excerpt, publishedAt, featuredImage }: NewsCardProps) {
	const publishedDate = new Date(publishedAt);
	const relativeDate = formatDistanceToNow(publishedDate, { addSuffix: true });
	const fullDate = publishedDate.toLocaleDateString('en-AU', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	return (
		<Link href={`/news/${slug}`} className="group">
			<div className="card bg-base-100 h-full overflow-hidden shadow-lg transition-all hover:shadow-xl">
				<figure className="relative aspect-video overflow-hidden">
					<Image
						src={featuredImage.url}
						alt={featuredImage.alt || title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</figure>
				<div className="card-body p-6">
					<h3 className="card-title line-clamp-2 text-xl font-bold">{title}</h3>
					<p className="text-base-content/70 line-clamp-3">{excerpt}</p>
					<div className="mt-2">
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className="text-base-content/60 text-sm font-bold"
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</div>
		</Link>
	);
}
