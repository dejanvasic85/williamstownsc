import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sanityImageLoader } from '@/lib/sanityImageLoader';

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
		<Link href={`/news/${slug}`} className="group mb-12 block md:mb-14">
			<article className="bg-surface border-base-200/70 overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
				<div className="grid gap-0 lg:min-h-[34rem] lg:grid-cols-5">
					<figure className="relative aspect-[16/10] overflow-hidden lg:col-span-3 lg:aspect-auto lg:h-full">
						<Image
							loader={sanityImageLoader}
							src={featuredImage.url}
							alt={featuredImage.alt || title}
							fill
							className="object-cover transition-transform duration-700 group-hover:scale-105"
							sizes="(max-width: 1024px) 100vw, 60vw"
							priority
						/>
						<div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/35 to-transparent lg:hidden" />
					</figure>

					<div className="flex flex-col justify-center px-6 py-8 md:px-8 md:py-10 lg:col-span-2 lg:px-10 lg:py-12">
						<p className="text-secondary mb-4 text-xs font-bold tracking-[0.24em] uppercase">
							Top story
						</p>
						<h2 className="mb-5 text-3xl leading-tight font-bold text-balance md:text-4xl xl:text-5xl">
							{title}
						</h2>
						<div className="bg-secondary mb-5 h-1 w-16 rounded-full" />
						<p className="text-base-content-secondary mb-6 text-base leading-relaxed md:text-lg">
							{excerpt}
						</p>
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className="text-base-content-secondary text-sm font-semibold tracking-wide"
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</article>
		</Link>
	);
}
