import { PageContainer } from '@/components/layout';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Menu',
	description: 'Navigate to all sections of our website'
};

const menuLinks = [
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
	},
	{
		name: 'Sponsors',
		href: '/sponsors',
		description: 'View our sponsors'
	},
	{
		name: 'Contact',
		href: '/contact',
		description: 'Get in touch with us'
	},
	{
		name: 'Events',
		href: '/events',
		description: 'Browse upcoming events'
	}
];

export default function MenuPage() {
	return (
		<PageContainer heading="Menu" intro="Navigate to all sections of our website">
			<div className="mx-auto max-w-2xl">
				<nav className="grid gap-4">
					{menuLinks.map((link) => (
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
