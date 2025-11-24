import { Icon } from '@/components/Icon';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Menu',
	description: 'Navigate to all sections of our website'
};

const menuLinks = [
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
		<main className="container mx-auto px-4 py-8 pb-24">
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 text-center">
					<Icon name="menu" className="text-primary mx-auto mb-4 h-16 w-16" />
					<h1 className="mb-2 text-4xl font-bold">Menu</h1>
					<p className="text-base-content/70 text-lg">Navigate to all sections of our website</p>
				</div>

				<nav className="grid gap-4">
					{menuLinks.map((link) => (
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
