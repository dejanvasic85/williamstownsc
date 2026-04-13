'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import type { KeyDateItem } from '@/lib/content';

type KeyDatesTimelineProps = {
	items: KeyDateItem[];
};

function parseKeyDate(dateString: string) {
	const parsedDate = parseISO(dateString);
	return isValid(parsedDate) ? parsedDate : null;
}

function formatDateLabel(dateString: string) {
	const parsedDate = parseKeyDate(dateString);
	return parsedDate ? format(parsedDate, 'EEE, d MMM') : dateString;
}

function formatMonthLabel(date: Date) {
	return format(date, 'MMMM yyyy');
}

function getClosestIndex(items: KeyDateItem[]) {
	const today = new Date();
	let closestIndex = 0;
	let bestDistance = Number.POSITIVE_INFINITY;
	let bestDelta = Number.POSITIVE_INFINITY;

	for (const [index, item] of items.entries()) {
		const parsedDate = parseKeyDate(item.date);
		if (!parsedDate) {
			continue;
		}

		const delta = differenceInCalendarDays(parsedDate, today);
		const distance = Math.abs(delta);
		const shouldReplace =
			distance < bestDistance ||
			(distance === bestDistance && delta >= 0 && bestDelta < 0) ||
			(distance === bestDistance && delta >= 0 && bestDelta >= 0 && delta < bestDelta);

		if (shouldReplace) {
			closestIndex = index;
			bestDistance = distance;
			bestDelta = delta;
		}
	}

	return closestIndex;
}

export function KeyDatesTimeline({ items }: KeyDatesTimelineProps) {
	const today = new Date();
	const closestIndex = getClosestIndex(items);
	const nextUpcomingIndex = items.findIndex((item) => {
		const parsedDate = parseKeyDate(item.date);
		return parsedDate ? differenceInCalendarDays(parsedDate, today) >= 0 : false;
	});

	useEffect(() => {
		const target = document.getElementById(`key-date-${closestIndex}`);
		if (!target) {
			return;
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const frame = window.requestAnimationFrame(() => {
			target.scrollIntoView({
				behavior: prefersReducedMotion ? 'auto' : 'smooth',
				block: 'center'
			});
		});

		return () => window.cancelAnimationFrame(frame);
	}, [closestIndex]);

	return (
		<section aria-label="Season timeline" className="relative mt-10">
			<div className="from-secondary/20 via-secondary to-primary/30 pointer-events-none absolute top-0 bottom-0 left-5 w-px bg-gradient-to-b md:left-8" />
			<div className="space-y-6 md:space-y-8">
				{items.map((item, index) => {
					const parsedDate = parseKeyDate(item.date);
					const previousDate = index > 0 ? parseKeyDate(items[index - 1]?.date) : null;
					const showMonthMarker =
						!!parsedDate &&
						(!previousDate || format(parsedDate, 'yyyy-MM') !== format(previousDate, 'yyyy-MM'));
					const dayDelta = parsedDate ? differenceInCalendarDays(parsedDate, today) : null;
					const isClosest = index === closestIndex;
					const isNextUpcoming = nextUpcomingIndex >= 0 && index === nextUpcomingIndex;
					const statusLabels = [
						dayDelta === 0 ? 'Today' : null,
						isNextUpcoming && dayDelta !== 0 ? 'Next up' : null
					].filter(Boolean) as string[];

					return (
						<div key={`${item.title}-${item.date}-${index}`}>
							{showMonthMarker && parsedDate && (
								<div className="mb-4 pl-14 md:mb-5 md:pl-20">
									<div className="flex items-center gap-3">
										<span className="bg-base-100/85 text-base-content/70 rounded-full border border-white/60 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] uppercase shadow-[0_12px_28px_rgba(16,24,40,0.08)] backdrop-blur-sm">
											{formatMonthLabel(parsedDate)}
										</span>
										<div className="from-secondary/35 h-px flex-1 bg-gradient-to-r to-transparent" />
									</div>
								</div>
							)}

							<article
								id={`key-date-${index}`}
								aria-current={isClosest ? 'date' : undefined}
								className="group relative scroll-mt-32 pl-14 md:scroll-mt-40 md:pl-20"
							>
								<div
									className={clsx(
										'absolute top-3 left-5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 transition-transform duration-300 md:left-8',
										isClosest || isNextUpcoming
											? 'border-primary bg-secondary shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-secondary)_22%,transparent),0_0_24px_color-mix(in_srgb,var(--color-primary)_28%,transparent)]'
											: 'border-secondary bg-base-100 group-hover:scale-110'
									)}
								/>

								<div className="flex flex-wrap items-center gap-3">
									<p className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
										{formatDateLabel(item.date)}
									</p>
									{statusLabels.map((label) => (
										<span
											key={label}
											className={clsx(
												'rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase',
												label === 'Today'
													? 'bg-secondary/20 text-secondary-content border-secondary/30 border'
													: 'bg-primary/10 text-primary'
											)}
										>
											{label}
										</span>
									))}
								</div>

								<div
									className={clsx(
										'bg-base-100/70 border-secondary/15 relative mt-3 overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_18px_40px_rgba(16,24,40,0.06)] backdrop-blur-sm transition-all duration-300 md:p-6',
										(isClosest || isNextUpcoming) &&
											'border-primary/20 shadow-[0_24px_60px_rgba(26,75,166,0.14)] ring-1 ring-white/40'
									)}
								>
									{(isClosest || isNextUpcoming) && (
										<div className="from-secondary/30 via-primary/10 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent" />
									)}

									<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
										<div className="max-w-3xl">
											<h2 className="text-base-content text-xl font-bold text-balance md:text-2xl">
												{item.title}
											</h2>
										</div>
									</div>

									{item.description && (
										<p className="text-base-content/70 mt-4 max-w-3xl text-sm leading-7 md:text-base">
											{item.description}
										</p>
									)}
								</div>
							</article>
						</div>
					);
				})}
			</div>
		</section>
	);
}
