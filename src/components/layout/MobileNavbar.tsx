'use client';

import { Icon, type IconProps } from '@/components/Icon';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
	name: string;
	href: string;
	icon: IconProps['name'];
};

const mobileNavItems: NavItem[] = [
	{ name: 'Home', href: '/', icon: 'home' },
	{ name: 'News', href: '/news', icon: 'news' },
	{ name: 'Football', href: '/football', icon: 'soccer' },
	{ name: 'Menu', href: '/menu', icon: 'menu' }
];

export function MobileNavbar() {
	const pathname = usePathname();

	const handleNavClick = () => {
		if (typeof window !== 'undefined' && 'vibrate' in navigator) {
			navigator.vibrate(20);
		}
	};

	const isItemActive = (item: NavItem) => {
		if (item.href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(item.href);
	};

	return (
		<nav className="fixed right-4 bottom-4 left-4 z-50 lg:hidden">
			<div className="bg-primary border-secondary mx-auto max-w-md rounded-full border-2 px-6 py-3 shadow-[0_0_30px_rgba(198,146,20,0.4)]">
				<ul className="flex items-center justify-around gap-2">
					{mobileNavItems.map((item) => {
						const isActive = isItemActive(item);

						return (
							<li key={item.name}>
								<Link
									href={item.href}
									onClick={handleNavClick}
									className={clsx(
										'relative flex w-16 flex-col items-center gap-0.5 rounded-full py-2.5 transition-all duration-300',
										isActive
											? 'bg-secondary text-primary animate-[navPop_0.4s_ease-out]'
											: 'text-neutral-content hover:bg-neutral-content/10'
									)}
									aria-label={item.name}
									aria-current={isActive ? 'page' : undefined}
								>
									<Icon name={item.icon} className="h-5 w-5" />
									<span className="text-[10px] leading-tight font-medium">{item.name}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
}
