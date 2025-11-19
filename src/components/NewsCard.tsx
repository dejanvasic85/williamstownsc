import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface NewsCardProps {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
	featured?: boolean;
}

export function NewsCard({
	slug,
	title,
	excerpt,
	publishedAt,
	featuredImage,
	featured = false
}: NewsCardProps) {
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
			<div
				className={`card h-full overflow-hidden shadow-lg transition-all hover:shadow-xl ${
					featured ? 'relative bg-gradient-to-br from-blue-900 to-slate-950' : 'bg-base-100'
				}`}
			>
				{featured && (
					<>
						<div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-800/20 blur-3xl" />
						<div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
					</>
				)}
				<figure className="relative aspect-video overflow-hidden">
					<Image
						src={featuredImage.url}
						alt={featuredImage.alt || title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</figure>
				<div className={`card-body relative p-6 ${featured ? 'text-white' : ''}`}>
					{featured && (
						<div className="bg-secondary mb-2 inline-block w-fit rounded px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
							Featured
						</div>
					)}
					<h3 className="card-title line-clamp-2 text-xl font-bold">{title}</h3>
					<p className={`line-clamp-3 ${featured ? 'text-white/90' : 'text-base-content/70'}`}>
						{excerpt}
					</p>
					<div className="mt-2">
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className={`text-sm font-bold ${featured ? 'text-white/80' : 'text-base-content/60'}`}
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</div>
		</Link>
	);
}
