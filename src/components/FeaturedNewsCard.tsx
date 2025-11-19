import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedNewsCardProps {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
}

export function FeaturedNewsCard({
	slug,
	title,
	excerpt,
	publishedAt,
	featuredImage
}: FeaturedNewsCardProps) {
	const publishedDate = new Date(publishedAt);
	const relativeDate = formatDistanceToNow(publishedDate, { addSuffix: true });
	const fullDate = publishedDate.toLocaleDateString('en-AU', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	return (
		<Link href={`/news/${slug}`} className="group block">
			<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-900 to-slate-950 shadow-xl transition-all hover:shadow-2xl lg:h-48">
				<div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-800/20 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
				<div className="relative flex h-full flex-col lg:flex-row">
					<figure className="relative h-48 w-full shrink-0 overflow-hidden lg:h-auto lg:w-2/5">
						<Image
							src={featuredImage.url}
							alt={featuredImage.alt || title}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-105"
							sizes="(max-width: 1024px) 100vw, 40vw"
						/>
					</figure>
					<div className="flex flex-1 flex-col justify-between p-4 text-white md:p-6">
						<div>
							<div className="bg-secondary mb-2 inline-block rounded px-2 py-1 text-xs font-bold tracking-wide text-white uppercase">
								Featured
							</div>
							<h3 className="mb-2 line-clamp-2 text-base font-bold md:text-xl">{title}</h3>
							<p className="line-clamp-2 text-xs text-white/90 md:text-sm">{excerpt}</p>
						</div>
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className="text-xs font-bold text-white/80 md:text-sm"
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</div>
		</Link>
	);
}
