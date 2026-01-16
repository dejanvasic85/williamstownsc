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
			<article className="relative overflow-hidden rounded-lg bg-linear-to-br from-blue-900 to-slate-950 shadow-2xl">
				<div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-800/20 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />

				<div className="relative grid gap-0 md:grid-cols-2">
					<figure className="relative aspect-video overflow-hidden md:aspect-auto md:h-full">
						<Image
							src={featuredImage.url}
							alt={featuredImage.alt || title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							sizes="(max-width: 768px) 100vw, 50vw"
							priority
						/>
					</figure>

					<div className="relative flex flex-col justify-center p-8 text-white md:p-12">
						<div className="bg-secondary mb-4 inline-block w-fit rounded px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
							Featured
						</div>
						<h2 className="mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl">
							{title}
						</h2>
						<p className="mb-6 text-lg leading-relaxed text-white/90 md:text-xl">{excerpt}</p>
						<time
							dateTime={publishedDate.toISOString()}
							title={fullDate}
							className="text-sm font-bold text-white/80"
						>
							{relativeDate}
						</time>
					</div>
				</div>
			</article>
		</Link>
	);
}
