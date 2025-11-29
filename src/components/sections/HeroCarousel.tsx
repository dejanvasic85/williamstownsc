'use client';

import { TransformedNewsArticle } from '@/lib/content';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface HeroCarouselProps {
	articles: TransformedNewsArticle[];
	autoplayInterval?: number;
}

export function HeroCarousel({ articles, autoplayInterval = 5000 }: HeroCarouselProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const startInterval = useCallback(() => {
		if (articles.length <= 1) return;

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		intervalRef.current = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % articles.length);
		}, autoplayInterval);
	}, [articles.length, autoplayInterval]);

	useEffect(() => {
		startInterval();
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [startInterval]);

	const handleSlideChange = (index: number) => {
		setCurrentSlide(index);
		startInterval();
	};

	const handlePrevious = () => {
		setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
		startInterval();
	};

	const handleNext = () => {
		setCurrentSlide((prev) => (prev + 1) % articles.length);
		startInterval();
	};

	if (articles.length === 0) {
		return null;
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('en-AU', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	return (
		<div className="relative w-full">
			<div className="carousel rounded-box relative h-[60vh] w-full overflow-hidden md:h-[70vh]">
				{articles.map((article, index) => (
					<div
						key={article._id}
						className={clsx(
							'carousel-item absolute h-full w-full transition-opacity duration-700',
							index === currentSlide ? 'opacity-100' : 'opacity-0'
						)}
					>
						<Link href={`/news/${article.slug}`} className="relative h-full w-full">
							<Image
								src={article.featuredImage.url}
								alt={article.featuredImage.alt || article.title}
								fill
								className="object-cover"
								priority={index === 0}
								sizes="100vw"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

							<div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
								<div className="flex justify-start">
									<div className="badge badge-primary badge-lg bg-primary/90 gap-2 px-4 py-3 font-semibold backdrop-blur-sm">
										{formatDate(article.publishedAt)}
									</div>
								</div>

								<div className="max-w-4xl px-12 sm:px-0">
									<h2
										className={clsx(
											'mb-3 font-bold text-white drop-shadow-lg md:leading-tight',
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
						onClick={handlePrevious}
						className="btn btn-circle text-secondary absolute top-1/2 left-4 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
						aria-label="Previous slide"
					>
						❮
					</button>
					<button
						onClick={handleNext}
						className="btn btn-circle text-secondary absolute top-1/2 right-4 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
						aria-label="Next slide"
					>
						❯
					</button>

					<div className="absolute right-6 bottom-6 flex gap-2">
						{articles.map((_, index) => (
							<button
								key={index}
								onClick={() => handleSlideChange(index)}
								className={`h-3 w-3 rounded-full transition-all ${
									index === currentSlide ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/75'
								}`}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
