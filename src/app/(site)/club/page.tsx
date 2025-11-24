import { Icon } from '@/components/Icon';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Club',
	description: 'Learn about our club, committee, policies, and locations'
};

const clubLinks = [
	{
		name: 'About',
		href: '/club/about',
		description: 'Learn about our club'
	},
	{
		name: 'Committee',
		href: '/club/committee',
		description: 'Meet our committee members'
	},
	{
		name: 'Policies and regulations',
		href: '/club/policies-and-regulations',
		description: 'Read our policies and regulations'
	},
	{
		name: 'Locations',
		href: '/club/locations',
		description: 'Find our club locations'
	}
];

export default function ClubPage() {
	return (
		<main className="container mx-auto px-4 py-8 pb-24">
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 text-center">
					<Icon name="club" className="text-primary mx-auto mb-4 h-16 w-16" />
					<h1 className="mb-2 text-4xl font-bold">Club</h1>
					<p className="text-base-content/70 text-lg">
						Learn about our club, committee, policies, and locations
					</p>
				</div>

				<nav className="grid gap-4">
					{clubLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="btn btn-lg btn-primary h-auto min-h-24 flex-col gap-2 py-6 text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
						>
							<div className="flex w-full items-center gap-4">
								<div className="flex-1 px-6">
									<span className="block text-xl font-bold">{link.name}</span>
									<span className="block text-sm opacity-80">{link.description}</span>
								</div>
							</div>
						</Link>
					))}
				</nav>
			</div>
		</main>
	);
}
