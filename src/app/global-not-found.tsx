import Link from 'next/link';
import './globals.css';

// Club-neutral on purpose: this renders when no club could be resolved (unknown host,
// a path already carrying a slug, an unregistered slug), so it carries no club name,
// logo or colours. A 404 inside a club renders [tenant]/not-found.tsx with branding.
export default function GlobalNotFound() {
	return (
		<html lang="en">
			<body>
				<div className="flex min-h-screen items-center justify-center px-4">
					<div className="text-center">
						<h1 className="mb-4 text-7xl font-bold">404</h1>
						<p className="mb-8 text-lg">Page not found.</p>
						<Link href="/" className="underline">
							Go home
						</Link>
					</div>
				</div>
			</body>
		</html>
	);
}
