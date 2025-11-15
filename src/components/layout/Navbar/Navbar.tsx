'use client';

import { Home, Newspaper, Volleyball, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mobileNavItems = [
	{ name: 'Home', href: '/', icon: Home },
	{ name: 'News', href: '/news', icon: Newspaper },
	{ name: 'Football', href: '/football', icon: Volleyball },
	{ name: 'Menu', href: '/menu', icon: Menu }
];

export function Navbar() {
	const pathname = usePathname();

	return (
		<>
			{/* Mobile Bottom Navigation */}
			<nav className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
				<div className="mx-auto max-w-md rounded-full bg-neutral/80 px-6 py-3 shadow-2xl backdrop-blur-2xl">
					<ul className="flex items-center justify-around gap-2">
						{mobileNavItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;
							return (
								<li key={item.name}>
									<Link
										href={item.href}
										className={`flex flex-col items-center gap-1 rounded-full px-4 py-4 transition-colors ${
											isActive
												? 'bg-primary text-primary-content'
												: 'text-neutral-content hover:bg-neutral-content/10'
										}`}
										aria-label={item.name}
										aria-current={isActive ? 'page' : undefined}
									>
										<Icon className="h-6 w-6" />
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			</nav>

			{/* Desktop Navigation - TODO: Design desktop version */}
			<nav className="hidden lg:block">
				<div className="navbar sticky top-0 z-50 bg-primary/80 backdrop-blur-lg shadow-lg">
					<div className="mx-auto w-full max-w-7xl px-4">
						<Link href="/" className="text-xl font-bold text-primary-content">
							Williamstown SC
						</Link>
					</div>
				</div>
			</nav>
		</>
	);
}
