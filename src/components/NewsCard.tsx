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
			<div className="card h-full overflow-hidden bg-base-100 shadow-lg transition-all hover:shadow-xl">
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
					<p className="line-clamp-3 text-base-content/70">{excerpt}</p>
					<div className="mt-2">
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className="text-sm font-bold text-base-content/60"
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</div>
		</Link>
	);
}
