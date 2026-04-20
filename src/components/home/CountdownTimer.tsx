'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { differenceInSeconds, parseISO } from 'date-fns';

type TimeRemaining = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

type CountdownTimerProps = {
	targetDate: string;
	targetTime: string;
	matchDurationMinutes?: number;
	countdownClassName?: string;
};

function calculateTimeRemaining(targetDate: string, targetTime: string): TimeRemaining {
	const now = new Date();
	const target = parseISO(`${targetDate}T${targetTime}`);
	const totalSeconds = differenceInSeconds(target, now);

	if (totalSeconds <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0 };
	}

	const days = Math.floor(totalSeconds / (24 * 60 * 60));
	const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
	const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
	const seconds = totalSeconds % 60;

	return { days, hours, minutes, seconds };
}

export function CountdownTimer({
	targetDate,
	targetTime,
	matchDurationMinutes = 120,
	countdownClassName = 'text-accent'
}: CountdownTimerProps) {
	const router = useRouter();
	const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
		calculateTimeRemaining(targetDate, targetTime)
	);

	useEffect(() => {
		const interval = setInterval(() => {
			const remaining = calculateTimeRemaining(targetDate, targetTime);
			setTimeRemaining(remaining);

			const expired =
				remaining.days === 0 &&
				remaining.hours === 0 &&
				remaining.minutes === 0 &&
				remaining.seconds === 0;
			if (expired) clearInterval(interval);
		}, 1000);

		return () => clearInterval(interval);
	}, [targetDate, targetTime]);

	useEffect(() => {
		const matchEnd = parseISO(`${targetDate}T${targetTime}`);
		const delay = Math.max(0, matchEnd.getTime() + matchDurationMinutes * 60 * 1000 - Date.now());

		refreshTimeoutRef.current = setTimeout(() => {
			router.refresh();
		}, delay);

		return () => {
			if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
		};
	}, [targetDate, targetTime, matchDurationMinutes, router]);

	const isExpired =
		timeRemaining.days === 0 &&
		timeRemaining.hours === 0 &&
		timeRemaining.minutes === 0 &&
		timeRemaining.seconds === 0;

	if (isExpired) {
		return (
			<p className={clsx(countdownClassName, 'text-xl font-bold md:text-2xl')}>Match underway!</p>
		);
	}

	return (
		<div className="grid grid-cols-4 gap-2 md:gap-3">
			<div className="flex flex-col items-center">
				<div className={clsx(countdownClassName, 'text-xl font-bold md:text-3xl')}>
					{timeRemaining.days}
				</div>
				<div className="text-base-content/70 text-xs">Days</div>
			</div>
			<div className="flex flex-col items-center">
				<div className={clsx(countdownClassName, 'text-xl font-bold md:text-3xl')}>
					{timeRemaining.hours}
				</div>
				<div className="text-base-content/70 text-xs">Hours</div>
			</div>
			<div className="flex flex-col items-center">
				<div className={clsx(countdownClassName, 'text-xl font-bold md:text-3xl')}>
					{timeRemaining.minutes}
				</div>
				<div className="text-base-content/70 text-xs">Mins</div>
			</div>
			<div className="flex flex-col items-center">
				<div className={clsx(countdownClassName, 'text-xl font-bold md:text-3xl')}>
					{timeRemaining.seconds}
				</div>
				<div className="text-base-content/70 text-xs">Secs</div>
			</div>
		</div>
	);
}
