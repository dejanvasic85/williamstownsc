'use client';

import { useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { LucideX } from 'lucide-react';

interface BannerMessage {
	message: string;
	type: 'info' | 'warning' | 'alert';
	id: string;
}

type BannerProps = {
	messages: BannerMessage[];
};

const dismissedAnnouncementsKey = 'dismissed_announcements';
const dismissedAnnouncementsEvent = 'wsc:announcement-dismissed';

function parseDismissed(raw: string | null): string[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function subscribeToDismissed(callback: () => void): () => void {
	window.addEventListener(dismissedAnnouncementsEvent, callback);
	return () => window.removeEventListener(dismissedAnnouncementsEvent, callback);
}

function getDismissedSnapshot(): string[] {
	return parseDismissed(localStorage.getItem(dismissedAnnouncementsKey));
}

function getDismissedServerSnapshot(): string[] {
	return [];
}

export const Banner = ({ messages }: BannerProps) => {
	const dismissedIds = useSyncExternalStore(
		subscribeToDismissed,
		getDismissedSnapshot,
		getDismissedServerSnapshot
	);

	const handleDismiss = (bannerId: string) => {
		const current = parseDismissed(localStorage.getItem(dismissedAnnouncementsKey));
		const updated = Array.from(new Set([...current, bannerId]));
		localStorage.setItem(dismissedAnnouncementsKey, JSON.stringify(updated));
		window.dispatchEvent(new Event(dismissedAnnouncementsEvent));
	};

	const activeMessages = messages.filter((m) => !dismissedIds.includes(m.id));

	if (!activeMessages.length) return null;

	const [message] = activeMessages;

	return (
		<div className="bg-base-100 fixed top-0 right-0 left-0 z-50 flex h-(--banner-height)">
			<div className="mx-auto flex w-full text-sm lg:container">
				<div
					key={message.id}
					role={message.type === 'alert' ? 'alert' : 'status'}
					aria-live={message.type === 'alert' ? 'assertive' : 'polite'}
					className={clsx(
						'dark:text-base-100 flex w-full items-center justify-between gap-1 px-2 lg:mx-auto lg:w-11/12 lg:justify-center lg:rounded-lg',
						{
							'bg-blue-300': message.type === 'info',
							'bg-amber-400': message.type === 'warning',
							'bg-red-300': message.type === 'alert'
						}
					)}
				>
					{message.message}
					<button
						className="btn-ghost btn btn-sm"
						onClick={() => handleDismiss(message.id)}
						aria-label="Dismiss banner"
					>
						<LucideX size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};
