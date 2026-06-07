'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { TransformedNewsArticle } from '@/lib/content';

type HeroNewsPanelProps = {
	articles: TransformedNewsArticle[];
	currentSlide: number;
	onSlideChange: (index: number) => void;
};

export function HeroNewsPanel({ articles, currentSlide, onSlideChange }: HeroNewsPanelProps) {
	if (articles.length === 0) {
		return null;
	}

	return (
		<div className="hidden lg:flex lg:flex-col">
			<div className="rounded-box border-base-content/10 bg-base-100/60 flex h-full flex-col border shadow-lg backdrop-blur-xl">
				<h2 className="px-6 pt-6 pb-2 text-2xl font-bold">News</h2>

				<div className="flex-1 overflow-y-auto px-6">
					{articles.map((article, index) => {
						const isActive = index === currentSlide;
						return (
							<button
								key={article._id}
								onClick={() => onSlideChange(index)}
								className={clsx(
									'block w-full truncate rounded px-2 py-3 text-left text-sm font-medium transition-colors',
									isActive
										? 'bg-primary text-primary-content'
										: 'border-base-content/10 text-base-content/70 hover:text-base-content border-b last:border-b-0'
								)}
							>
								{article.title}
							</button>
						);
					})}
				</div>

				<div className="border-base-content/10 border-t px-6 py-4">
					<Link href="/news" className="btn btn-primary btn-outline btn-sm w-full">
						View all news
					</Link>
				</div>
			</div>
		</div>
	);
}
