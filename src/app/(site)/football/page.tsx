import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageContainer } from '@/components/layout';

export const metadata: Metadata = {
	title: 'Football',
	description: 'Explore our football teams, programs, and merchandise'
};

const footballLinks = [
	{
		name: 'Teams',
		href: '/football/teams',
		description: 'View our football teams'
	},
	{
		name: 'Programs',
		href: '/football/programs',
		description: 'Explore our football programs'
	},
	{
		name: 'Merchandise',
		href: '/football/merchandise',
		description: 'Shop our football merchandise'
	}
];

export default function FootballPage() {
	return (
		<PageContainer heading="Football" intro="Explore our football teams, programs, and merchandise">
			<div className="mx-auto max-w-2xl">
				<nav className="grid gap-4">
					{footballLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="bg-base-100 flex items-center justify-between rounded-lg p-6 shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
						>
							<div>
								<span className="text-base-content block text-xl font-bold">{link.name}</span>
								<span className="text-base-content/60 block text-sm">{link.description}</span>
							</div>
							<ArrowRight className="text-base-content/40 h-6 w-6 flex-shrink-0" />
						</Link>
					))}
				</nav>
			</div>
		</PageContainer>
	);
}
