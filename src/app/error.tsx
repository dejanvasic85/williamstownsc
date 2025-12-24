'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Home, RotateCcw } from 'lucide-react';

export default function Error({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error('Error:', error);
	}, [error]);

	return (
		<html lang="en">
			<body className="bg-base-200">
				<div className="flex min-h-screen items-center justify-center px-4 py-16">
					<div className="text-center">
						<div className="mb-8">
							<h1 className="text-primary mb-4 text-7xl font-bold sm:text-9xl">500</h1>
							<div className="mb-2 text-2xl font-semibold sm:text-3xl">Own Goal!</div>
							<p className="text-base-content/70 mx-auto max-w-md text-lg">
								Something went wrong on our end. Don&apos;t worry, we&apos;re working to get back in
								the game.
							</p>
							{error.digest && (
								<p className="text-base-content/50 mt-4 text-sm">Error ID: {error.digest}</p>
							)}
						</div>

						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<button onClick={() => reset()} className="btn btn-primary gap-2">
								<RotateCcw className="h-5 w-5" />
								Try Again
							</button>
							<Link href="/" className="btn btn-outline gap-2">
								<Home className="h-5 w-5" />
								Back to Home
							</Link>
						</div>

						<div className="text-base-content/50 mt-12 text-sm">
							<p>If this problem persists, please contact us for assistance.</p>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
