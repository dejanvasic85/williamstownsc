'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
	matchDurationMinutes = 120
}: CountdownTimerProps) {
	const router = useRouter();
	const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
		calculateTimeRemaining(targetDate, targetTime)
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeRemaining(calculateTimeRemaining(targetDate, targetTime));
		}, 1000);

		return () => clearInterval(interval);
	}, [targetDate, targetTime]);

	const isExpired =
		timeRemaining.days === 0 &&
		timeRemaining.hours === 0 &&
		timeRemaining.minutes === 0 &&
		timeRemaining.seconds === 0;

	useEffect(() => {
		if (!isExpired) return;

		const matchEnd = parseISO(`${targetDate}T${targetTime}`);
		const msUntilMatchEnd = matchEnd.getTime() + matchDurationMinutes * 60 * 1000 - Date.now();
		const delay = Math.max(0, msUntilMatchEnd);

		refreshTimeoutRef.current = setTimeout(() => {
			router.refresh();
		}, delay);

		return () => {
			if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
		};
	}, [isExpired, targetDate, targetTime, matchDurationMinutes, router]);

	if (isExpired) {
		return <p className="text-accent text-xl font-bold md:text-2xl">Match underway!</p>;
	}

	return (
		<div className="grid grid-cols-4 gap-2 md:gap-3">
			<div className="flex flex-col items-center">
				<div className="text-accent text-xl font-bold md:text-3xl">{timeRemaining.days}</div>
				<div className="text-base-content/70 text-xs">Days</div>
			</div>
			<div className="flex flex-col items-center">
				<div className="text-accent text-xl font-bold md:text-3xl">{timeRemaining.hours}</div>
				<div className="text-base-content/70 text-xs">Hours</div>
			</div>
			<div className="flex flex-col items-center">
				<div className="text-accent text-xl font-bold md:text-3xl">{timeRemaining.minutes}</div>
				<div className="text-base-content/70 text-xs">Mins</div>
			</div>
			<div className="flex flex-col items-center">
				<div className="text-accent text-xl font-bold md:text-3xl">{timeRemaining.seconds}</div>
				<div className="text-base-content/70 text-xs">Secs</div>
			</div>
		</div>
	);
}
