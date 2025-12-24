import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Link from 'next/link';
import clsx from 'clsx';
import { Home } from 'lucide-react';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin']
});

const poppins = Poppins({
	variable: '--font-poppins',
	weight: ['400', '500', '600', '700', '800'],
	subsets: ['latin']
});

export const metadata: Metadata = {
	title: '404 - Page Not Found | Williamstown SC',
	description: 'The page you are looking for could not be found.'
};

export default function NotFound() {
	return (
		<html lang="en">
			<body
				data-theme="williamstown"
				className={clsx(inter.variable, poppins.variable, 'bg-base-200 antialiased')}
			>
				<div className="flex min-h-screen items-center justify-center px-4 py-16">
					<div className="text-center">
						<div className="mb-8">
							<h1 className="text-primary mb-4 text-7xl font-bold sm:text-9xl">404</h1>
							<div className="mb-2 text-2xl font-semibold sm:text-3xl">Off the Pitch!</div>
							<p className="text-base-content/70 mx-auto max-w-md text-lg">
								Looks like this page has been shown the red card. We couldn&apos;t find what you
								were looking for.
							</p>
						</div>

						<Link href="/" className="btn btn-primary gap-2">
							<Home className="h-5 w-5" />
							Back to Home
						</Link>
					</div>
				</div>
			</body>
		</html>
	);
}
