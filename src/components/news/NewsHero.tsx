import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NewsHeroProps {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
}

export function NewsHero({ slug, title, excerpt, publishedAt, featuredImage }: NewsHeroProps) {
	const publishedDate = new Date(publishedAt);
	const relativeDate = formatDistanceToNow(publishedDate, { addSuffix: true });
	const fullDate = publishedDate.toLocaleDateString('en-AU', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	return (
		<Link href={`/news/${slug}`} className="group mb-8 block md:mb-12">
			<article className="bg-surface overflow-hidden rounded-lg shadow-lg transition-shadow hover:shadow-xl">
				<div className="grid gap-0 md:grid-cols-5">
					<figure className="relative aspect-video overflow-hidden md:col-span-2 md:aspect-auto md:h-full">
						<Image
							src={featuredImage.url}
							alt={featuredImage.alt || title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							sizes="(max-width: 768px) 100vw, 40vw"
							priority
						/>
					</figure>

					<div className="flex flex-col justify-center p-6 md:col-span-3 md:p-10">
						<h2 className="mb-4 text-2xl leading-tight font-bold md:text-3xl lg:text-4xl">
							{title}
						</h2>
						<p className="text-base-content-secondary mb-4 text-base leading-relaxed md:text-lg">
							{excerpt}
						</p>
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className="text-base-content-secondary text-sm font-medium"
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</article>
		</Link>
	);
}
