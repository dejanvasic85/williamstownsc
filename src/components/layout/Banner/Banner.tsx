'use client';

import { useTransition } from 'react';
import clsx from 'clsx';
import { LucideX } from 'lucide-react';
import { dismissBanner } from './actions';

interface BannerMessage {
	message: string;
	type: 'info' | 'warning' | 'alert';
	id: string;
}

interface BannerProps {
	messages: BannerMessage[];
}

export const Banner = ({ messages }: BannerProps) => {
	const [isPending, startTransition] = useTransition();

	const handleDismiss = (bannerId: string) => {
		startTransition(async () => {
			await dismissBanner(bannerId);
		});
	};

	if (!messages.length) return null;

	// Display one message at a time
	const [message] = messages;

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
						disabled={isPending}
						aria-label="Dismiss banner"
					>
						<LucideX size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};
