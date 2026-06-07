'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TransformedNewsArticle } from '@/lib/content';
import { HeroCarousel } from './HeroCarousel';
import { HeroNewsPanel } from './HeroNewsPanel';

type HeroSectionProps = {
	articles: TransformedNewsArticle[];
};

const autoplayInterval = 5000;

export function HeroSection({ articles }: HeroSectionProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const startInterval = useCallback(() => {
		if (articles.length <= 1 || isPaused) return;

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		intervalRef.current = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % articles.length);
		}, autoplayInterval);
	}, [articles.length, isPaused]);

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

	const handleTogglePause = () => {
		setIsPaused((prev) => {
			const newPausedState = !prev;
			if (!newPausedState) {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
				intervalRef.current = setInterval(() => {
					setCurrentSlide((prevSlide) => (prevSlide + 1) % articles.length);
				}, autoplayInterval);
			}
			return newPausedState;
		});
	};

	const handleMouseEnter = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
	};

	const handleMouseLeave = () => {
		if (!isPaused) {
			startInterval();
		}
	};

	if (articles.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-6">
			{/* On desktop: CSS grid so both columns share the same row height naturally */}
			<div className="lg:rounded-box lg:grid lg:grid-cols-[2fr_1fr] lg:overflow-hidden lg:shadow-lg">
				<HeroCarousel
					articles={articles}
					currentSlide={currentSlide}
					isPaused={isPaused}
					className="h-[65vh] md:h-[55vh] lg:h-full"
					onSlideChange={handleSlideChange}
					onPrevious={handlePrevious}
					onNext={handleNext}
					onTogglePause={handleTogglePause}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				/>

				<HeroNewsPanel
					articles={articles}
					currentSlide={currentSlide}
					onSlideChange={handleSlideChange}
				/>
			</div>

			{/* View all news — mobile only */}
			<div className="flex justify-center lg:hidden">
				<Link href="/news" className="btn btn-primary btn-outline">
					View all news
				</Link>
			</div>
		</div>
	);
}
