'use client';

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
			<div className="container mx-auto flex max-w-10/12 flex-col items-center justify-center rounded-lg bg-amber-400 px-2 text-sm">
				{messages.map((message) => (
					<div key={message.id} className="flex items-center gap-2">
						{message.message}
						<button className="btn-ghost btn btn-sm">
							<LucideX size={16} />
						</button>
					</div>
				))}
				˝
			</div>
		</div>
	);
};
