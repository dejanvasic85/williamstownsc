import { Icon } from '@/components/Icon';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Football',
	description: 'Explore our football teams, programs, and merchandise'
};

const footballLinks = [
	{
		name: 'Teams',
		href: '/football/teams',
		icon: 'users' as const,
		description: 'View our football teams'
	},
	{
		name: 'Programs',
		href: '/football/programs',
		icon: 'calendar' as const,
		description: 'Explore our football programs'
	},
	{
		name: 'Merchandise',
		href: '/football/merchandise',
		icon: 'shopping-bag' as const,
		description: 'Shop our football merchandise'
	}
];

export default function FootballPage() {
	return (
		<main className="container mx-auto px-4 py-8 pb-24">
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 text-center">
					<Icon name="soccer" className="text-primary mx-auto mb-4 h-16 w-16" />
					<h1 className="mb-2 text-4xl font-bold">Football</h1>
					<p className="text-base-content/70 text-lg">
						Explore our football teams, programs, and merchandise
					</p>
				</div>

				<nav className="grid gap-4">
					{footballLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="btn btn-lg btn-primary h-auto min-h-24 flex-col gap-2 py-6 text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
						>
							<div className="flex w-full items-center gap-4">
								<Icon name={link.icon} className="h-8 w-8 flex-shrink-0" />
								<div className="flex-1">
									<span className="block text-xl font-bold">{link.name}</span>
									<span className="block text-sm opacity-80">{link.description}</span>
								</div>
								<Icon name="chevron-right" className="h-6 w-6 flex-shrink-0" />
							</div>
						</Link>
					))}
				</nav>
			</div>
		</main>
	);
}
