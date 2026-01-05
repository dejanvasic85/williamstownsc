'use client';

import clsx from 'clsx';
import { LucideX } from 'lucide-react';

interface BannerMessage {
	message: string;
	type: 'info' | 'warning' | 'alert';
	id: string;
}

interface BannerProps {
	messages: BannerMessage[];
}

export const Banner = ({ messages }: BannerProps) => {
	return (
		<div className="fixed top-0 right-0 left-0 z-50 flex h-(--banner-height)">
			<div className="mx-auto flex w-full text-sm lg:container">
				{messages.map((message) => (
					<div
						key={message.id}
						className={clsx(
							'flex w-full items-center justify-between gap-1 bg-amber-300 px-2 lg:mx-auto lg:w-11/12 lg:justify-center lg:rounded-lg',
							{
								'bg-blue-300': message.type === 'info',
								'bg-amber-300': message.type === 'warning',
								'bg-red-300': message.type === 'alert'
							}
						)}
					>
						{message.message}
						<button className="btn-ghost btn btn-sm">
							<LucideX size={16} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
};
