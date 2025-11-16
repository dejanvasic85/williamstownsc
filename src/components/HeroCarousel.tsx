'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NewsArticle {
	_id: string;
	title: string;
	slug: { current: string };
	publishedAt: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
	excerpt: string;
}

interface HeroCarouselProps {
	articles: NewsArticle[];
	autoplayInterval?: number;
}

export function HeroCarousel({ articles, autoplayInterval = 5000 }: HeroCarouselProps) {
	const [currentSlide, setCurrentSlide] = useState(0);

	useEffect(() => {
		if (articles.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % articles.length);
		}, autoplayInterval);

		return () => clearInterval(interval);
	}, [articles.length, autoplayInterval]);

	const handleSlideChange = (index: number) => {
		setCurrentSlide(index);
	};

	const handlePrevious = () => {
		setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
	};

	const handleNext = () => {
		setCurrentSlide((prev) => (prev + 1) % articles.length);
	};

	if (articles.length === 0) {
		return null;
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	return (
		<div className="relative w-full">
			<div className="carousel relative h-[60vh] w-full overflow-hidden rounded-box md:h-[70vh]">
				{articles.map((article, index) => (
					<div
						key={article._id}
						className={`carousel-item absolute h-full w-full transition-opacity duration-700 ${
							index === currentSlide ? 'opacity-100' : 'opacity-0'
						}`}
					>
						<Link href={`/news/${article.slug.current}`} className="relative h-full w-full">
							<Image
								src={article.featuredImage.url}
								alt={article.featuredImage.alt || article.title}
								fill
								className="object-cover"
								priority={index === 0}
								sizes="100vw"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

							<div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
								<div className="flex justify-start">
									<div className="badge badge-primary badge-lg gap-2 bg-primary/90 px-4 py-3 font-semibold backdrop-blur-sm">
										{formatDate(article.publishedAt)}
									</div>
								</div>

								<div className="max-w-4xl">
									<h2 className="mb-3 text-3xl font-bold text-white drop-shadow-lg md:text-5xl md:leading-tight">
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
						className="btn btn-circle absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
						aria-label="Previous slide"
					>
						❮
					</button>
					<button
						onClick={handleNext}
						className="btn btn-circle absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
						aria-label="Next slide"
					>
						❯
					</button>

					<div className="absolute bottom-6 right-6 flex gap-2">
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
