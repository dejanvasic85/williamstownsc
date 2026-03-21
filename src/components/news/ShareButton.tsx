'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';

type ShareButtonProps = {
	title: string;
	url: string;
};

export function ShareButton({ title, url }: ShareButtonProps) {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	const scheduleCopiedReset = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		setCopied(true);
		timeoutRef.current = setTimeout(() => setCopied(false), 2000);
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ title, url });
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') return;
				try {
					await navigator.clipboard.writeText(url);
					scheduleCopiedReset();
				} catch {
					// Silent fail — clipboard unavailable
				}
			}
		} else {
			try {
				await navigator.clipboard.writeText(url);
				scheduleCopiedReset();
			} catch {
				// Silent fail — clipboard unavailable
			}
		}
	};

	return (
		<button
			onClick={handleShare}
			className="btn btn-outline btn-sm gap-2"
			aria-label={copied ? 'Link copied to clipboard' : 'Share this article'}
		>
			{copied ? (
				<Check className="h-4 w-4" aria-hidden="true" />
			) : (
				<Share2 className="h-4 w-4" aria-hidden="true" />
			)}
			{copied ? 'Copied!' : 'Share'}
		</button>
	);
}
