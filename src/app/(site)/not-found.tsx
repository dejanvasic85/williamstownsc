import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata: Metadata = {
	title: '404 - Page Not Found | Williamstown SC',
	description: 'The page you are looking for could not be found.'
};

export default function NotFound() {
	return (
		<div className="bg-base-200 flex min-h-[calc(100vh-var(--navbar-total-height-desktop))] items-center justify-center px-4 py-16">
			<div className="text-center">
				<div className="mb-8">
					<h1 className="text-primary mb-4 text-7xl font-bold sm:text-9xl">404</h1>
					<div className="mb-2 text-2xl font-semibold sm:text-3xl">Off the Pitch!</div>
					<p className="text-base-content/70 mx-auto max-w-md text-lg">
						Looks like this page has been shown the red card. We couldn&apos;t find what you were
						looking for.
					</p>
				</div>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link href="/" className="btn btn-primary gap-2">
						<Home className="h-5 w-5" />
						Back to Home
					</Link>
					<Link href="/news" className="btn btn-outline gap-2">
						<Search className="h-5 w-5" />
						Browse News
					</Link>
				</div>

				<div className="text-base-content/50 mt-12 text-sm">
					<p>Need help? Visit our contact page or check out our football programs.</p>
				</div>
			</div>
		</div>
	);
}
