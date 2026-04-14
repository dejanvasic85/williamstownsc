import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sanityImageLoader } from '@/lib/sanityImageLoader';

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
	size?: 'default' | 'large';
}

export function NewsCard({
	slug,
	title,
	excerpt,
	publishedAt,
	featuredImage,
	featured = false,
	size = 'default'
}: NewsCardProps) {
	const publishedDate = new Date(publishedAt);
	const relativeDate = formatDistanceToNow(publishedDate, { addSuffix: true });
	const fullDate = publishedDate.toLocaleDateString('en-AU', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const isLarge = size === 'large';

	return (
		<Link href={`/news/${slug}`} className="group block h-full">
			<div
				className={`card bg-surface border-base-200/70 relative h-full overflow-hidden border shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${
					featured ? 'border-l-secondary border-l-4' : ''
				}`}
			>
				<figure
					className={`relative overflow-hidden ${isLarge ? 'aspect-[16/10]' : 'aspect-video'}`}
				>
					<Image
						loader={sanityImageLoader}
						src={featuredImage.url}
						alt={featuredImage.alt || title}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-105"
						sizes={
							isLarge
								? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw'
								: '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'
						}
					/>
				</figure>
				<div className={`card-body relative ${isLarge ? 'p-7' : 'p-6'}`}>
					<h3
						className={`card-title line-clamp-2 font-bold text-balance ${
							isLarge ? 'text-2xl leading-tight' : 'text-xl leading-snug'
						}`}
					>
						{title}
					</h3>
					<p
						className={`text-(--color-base-content-secondary) ${isLarge ? 'line-clamp-4' : 'line-clamp-3'}`}
					>
						{excerpt}
					</p>
					<div className="mt-2">
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className="text-sm font-semibold text-(--color-base-content-secondary)"
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</div>
		</Link>
	);
}
