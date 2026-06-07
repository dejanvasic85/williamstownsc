'use client';

import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { TransformedNewsArticle } from '@/lib/content';
import { sanityImageLoader } from '@/lib/sanityImageLoader';

type HeroCarouselProps = {
	articles: TransformedNewsArticle[];
	currentSlide: number;
	isPaused: boolean;
	className?: string;
	onSlideChange: (index: number) => void;
	onPrevious: () => void;
	onNext: () => void;
	onTogglePause: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
};

export function HeroCarousel({
	articles,
	currentSlide,
	isPaused,
	className,
	onSlideChange,
	onPrevious,
	onNext,
	onTogglePause,
	onMouseEnter,
	onMouseLeave
}: HeroCarouselProps) {
	if (articles.length === 0) {
		return null;
	}

	return (
		<section
			className="group relative h-full w-full"
			role="region"
			aria-roledescription="carousel"
			aria-label="Featured news"
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onFocusCapture={onMouseEnter}
			onBlurCapture={onMouseLeave}
		>
			<div
				className={clsx(
					'carousel md:rounded-box relative w-full overflow-hidden',
					className || 'h-[55vh]'
				)}
				aria-live="polite"
				aria-atomic="true"
			>
				{articles.map((article, index) => (
					<div
						key={article._id}
						role="group"
						aria-roledescription="slide"
						aria-label={`Slide ${index + 1} of ${articles.length}: ${article.title}`}
						aria-hidden={index !== currentSlide}
						className={clsx(
							'carousel-item absolute h-full w-full transition-opacity duration-700',
							index === currentSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
						)}
					>
						<Link href={`/news/${article.slug}`} className="relative h-full w-full">
							<Image
								loader={sanityImageLoader}
								src={article.mobileImage?.url || article.featuredImage.url}
								alt={article.mobileImage?.alt || article.featuredImage.alt || article.title}
								fill
								className="object-cover md:hidden"
								priority={index === 0}
								quality={90}
								sizes="100vw"
							/>
							<Image
								loader={sanityImageLoader}
								src={article.featuredImage.url}
								alt={article.featuredImage.alt || article.title}
								fill
								className="hidden object-cover md:block"
								priority={index === 0}
								quality={90}
								sizes="67vw"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
							<div className="absolute inset-0 flex flex-col-reverse justify-between p-6 pb-16 md:flex-col md:p-10 md:pb-10">
								<div className="max-w-4xl sm:px-0">
									<h2
										className={clsx(
											'mb-3 font-bold text-white drop-shadow-lg group-hover:underline md:leading-tight',
											article.title.length > 80 && 'text-xl sm:text-2xl md:text-3xl',
											article.title.length <= 80 &&
												article.title.length > 50 &&
												'text-2xl sm:text-3xl md:text-4xl',
											article.title.length <= 50 && 'text-2xl sm:text-3xl md:text-5xl'
										)}
									>
										{article.title}
									</h2>
									<p className="hidden text-lg text-white/90 drop-shadow-md md:block">
										{article.excerpt}
									</p>
								</div>
							</div>
						</Link>
					</div>
				))}
			</div>

			{articles.length > 1 && (
				<>
					<button
						onClick={onPrevious}
						className="btn btn-circle text-secondary absolute top-1/2 left-4 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
						aria-label="Go to previous slide"
					>
						<ChevronLeft className="h-6 w-6" aria-hidden="true" />
					</button>
					<button
						onClick={onNext}
						className="btn btn-circle text-secondary absolute top-1/2 right-4 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
						aria-label="Go to next slide"
					>
						<ChevronRight className="h-6 w-6" aria-hidden="true" />
					</button>

					<div className="absolute right-6 bottom-6 flex items-center gap-3">
						<button
							onClick={onTogglePause}
							className="btn btn-circle btn-sm text-secondary bg-white/10 backdrop-blur-sm hover:bg-white/20"
							aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
							aria-pressed={isPaused}
						>
							{isPaused ? (
								<Play className="h-4 w-4" aria-hidden="true" />
							) : (
								<Pause className="h-4 w-4" aria-hidden="true" />
							)}
						</button>
						<span className="sr-only" aria-live="polite" role="status">
							{isPaused ? 'Carousel paused' : 'Carousel playing'}
						</span>

						<div className="flex gap-2" role="tablist" aria-label="Slide controls">
							{articles.map((article, index) => (
								<button
									key={index}
									role="tab"
									onClick={() => onSlideChange(index)}
									className={`h-3 w-3 rounded-full transition-all ${
										index === currentSlide ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/75'
									}`}
									aria-label={`Go to slide ${index + 1}: ${article.title}`}
									aria-selected={index === currentSlide}
								/>
							))}
						</div>
					</div>
				</>
			)}
		</section>
	);
}
