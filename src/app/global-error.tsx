'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

type GlobalErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html>
			<body>
				<div className="flex min-h-screen items-center justify-center px-4">
					<div className="text-center">
						<h1 className="mb-4 text-7xl font-bold">500</h1>
						<p className="mb-8 text-lg">Something went wrong.</p>
						<button type="button" onClick={reset} className="btn btn-primary">
							Try again
						</button>
					</div>
				</div>
			</body>
		</html>
	);
}
