'use client';

import { Icon, type IconProps } from '@/components/Icon';
import { navItems } from '@/config/navigation';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = {
	name: string;
	href: string;
	icon: IconProps['name'];
	submenu?: { name: string; href: string }[];
};

const mobileNavItems: NavItem[] = [
	{ name: 'Home', href: '/', icon: 'home' },
	{ name: 'News', href: '/news', icon: 'news' },
	{
		name: 'Football',
		href: '/football',
		icon: 'soccer',
		submenu: navItems.find((item) => item.name === 'Football')?.submenu
	},
	{
		name: 'Club',
		href: '/club',
		icon: 'club',
		submenu: navItems.find((item) => item.name === 'Club')?.submenu
	},
	{ name: 'Menu', href: '/menu', icon: 'menu' }
];

export function MobileNavbar() {
	const pathname = usePathname();
	const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

	const handleNavClick = () => {
		if (typeof window !== 'undefined' && 'vibrate' in navigator) {
			navigator.vibrate(20);
		}
	};

	const toggleSubmenu = (itemName: string) => {
		setOpenSubmenu((prev) => (prev === itemName ? null : itemName));
	};

	const closeSubmenu = () => {
		setOpenSubmenu(null);
	};

	return (
		<nav className="fixed right-4 bottom-4 left-4 z-50 lg:hidden">
			<div className="bg-primary mx-auto max-w-md rounded-full px-6 py-3 shadow-[0_0_60px_rgba(26,75,166,0.6)] backdrop-blur-md">
				<ul className="flex items-center justify-around gap-2">
					{mobileNavItems.map((item) => {
						const isActive = pathname === item.href;
						const hasSubmenu = item.submenu && item.submenu.length > 0;
						const isSubmenuActive =
							hasSubmenu && item.submenu?.some((sub) => pathname === sub.href);
						const isSubmenuOpen = openSubmenu === item.name;

						if (hasSubmenu) {
							return (
								<li key={item.name} className="relative">
									<button
										onClick={() => toggleSubmenu(item.name)}
										className={clsx(
											'relative flex flex-col items-center gap-0.5 rounded-full px-3 py-2.5 transition-all duration-300',
											isActive || isSubmenuActive
												? 'bg-secondary text-primary animate-[navPop_0.4s_ease-out]'
												: 'text-neutral-content hover:bg-neutral-content/10'
										)}
										aria-label={item.name}
										aria-expanded={isSubmenuOpen}
										aria-haspopup="true"
										aria-current={isActive || isSubmenuActive ? 'page' : undefined}
									>
										<Icon name={item.icon} className="h-5 w-5" />
										<span className="text-[10px] leading-tight font-medium">{item.name}</span>
									</button>

									{isSubmenuOpen && (
										<>
											<div
												className="fixed inset-0 z-40"
												onClick={closeSubmenu}
												aria-hidden="true"
											/>
											<ul
												role="menu"
												className="absolute bottom-full left-1/2 mb-4 flex min-w-40 -translate-x-1/2 flex-col gap-2"
											>
												{item.submenu?.map((subItem, index) => {
													const isSubActive = pathname === subItem.href;
													const totalItems = item.submenu?.length || 0;
													const reverseIndex = totalItems - 1 - index;
													return (
														<li
															key={subItem.name}
															role="none"
															style={{
																animation: `dropdownItemSlideUp 0.1s ease-out ${reverseIndex * 0.02}s both`
															}}
														>
															<Link
																href={subItem.href}
																role="menuitem"
																onClick={() => {
																	handleNavClick();
																	closeSubmenu();
																}}
																className={clsx(
																	'bg-primary/95 block rounded-full p-4 text-center text-lg whitespace-nowrap shadow-lg backdrop-blur-md transition-colors',
																	isSubActive
																		? 'text-secondary font-bold'
																		: 'text-neutral-content hover:text-secondary font-medium'
																)}
																aria-current={isSubActive ? 'page' : undefined}
															>
																{subItem.name}
															</Link>
														</li>
													);
												})}
											</ul>
										</>
									)}
								</li>
							);
						}

						return (
							<li key={item.name}>
								<Link
									href={item.href}
									onClick={handleNavClick}
									className={clsx(
										'relative flex flex-col items-center gap-0.5 rounded-full px-3 py-2.5 transition-all duration-300',
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
