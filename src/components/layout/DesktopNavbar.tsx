'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { useSearchModal } from '@/components/search';
import { NavItem } from '@/lib/navigation';

type DesktopNavbarProps = {
	navItems: NavItem[];
	logoUrl?: string;
	logoAlt?: string;
	clubName?: string;
	socials?: {
		facebook?: string;
		instagram?: string;
		youtube?: string;
	};
	homeGroundLink?: string;
	hasAnnouncements?: boolean;
};

export function DesktopNavbar({
	navItems,
	logoUrl,
	logoAlt,
	clubName,
	socials,
	homeGroundLink,
	hasAnnouncements
}: DesktopNavbarProps) {
	const pathname = usePathname();
	const { open: openSearchModal } = useSearchModal();
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const [isScrolled, setIsScrolled] = useState(false);
	const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1);
	const dropdownRefs = useRef<Record<string, HTMLLIElement | null>>({});
	const menuItemRefs = useRef<Record<string, (HTMLAnchorElement | null)[]>>({});

	const toggleDropdown = (itemName: string) => {
		setOpenDropdown((prev) => (prev === itemName ? null : itemName));
		setFocusedItemIndex(-1);
	};

	const closeDropdown = () => {
		setOpenDropdown(null);
		setFocusedItemIndex(-1);
	};

	const handleDropdownKeyDown = (event: React.KeyboardEvent, itemName: string) => {
		const menuItems = menuItemRefs.current[itemName] || [];

		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (!openDropdown) {
					setOpenDropdown(itemName);
					setFocusedItemIndex(0);
					setTimeout(() => {
						menuItems[0]?.focus();
					}, 0);
				} else {
					closeDropdown();
				}
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (!openDropdown) {
					setOpenDropdown(itemName);
					setFocusedItemIndex(0);
					setTimeout(() => {
						menuItems[0]?.focus();
					}, 0);
				} else {
					const nextIndex = Math.min(focusedItemIndex + 1, menuItems.length - 1);
					setFocusedItemIndex(nextIndex);
					menuItems[nextIndex]?.focus();
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (openDropdown) {
					const prevIndex = Math.max(focusedItemIndex - 1, 0);
					setFocusedItemIndex(prevIndex);
					menuItems[prevIndex]?.focus();
				}
				break;
		}
	};

	const handleMenuItemKeyDown = (
		event: React.KeyboardEvent,
		itemName: string,
		currentIndex: number
	) => {
		const menuItems = menuItemRefs.current[itemName] || [];

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				const nextIndex = Math.min(currentIndex + 1, menuItems.length - 1);
				setFocusedItemIndex(nextIndex);
				menuItems[nextIndex]?.focus();
				break;
			case 'ArrowUp':
				event.preventDefault();
				const prevIndex = Math.max(currentIndex - 1, 0);
				setFocusedItemIndex(prevIndex);
				menuItems[prevIndex]?.focus();
				break;
			case 'Home':
				event.preventDefault();
				setFocusedItemIndex(0);
				menuItems[0]?.focus();
				break;
			case 'End':
				event.preventDefault();
				const lastIndex = menuItems.length - 1;
				setFocusedItemIndex(lastIndex);
				menuItems[lastIndex]?.focus();
				break;
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (openDropdown && dropdownRefs.current[openDropdown]) {
				const dropdown = dropdownRefs.current[openDropdown];
				if (dropdown && !dropdown.contains(event.target as Node)) {
					closeDropdown();
				}
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeDropdown();
			}
		};

		if (openDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [openDropdown]);

	const socialLinks = [
		...(homeGroundLink ? [{ name: 'Home Ground', href: homeGroundLink, icon: 'mapPin' }] : []),
		...(socials?.instagram
			? [{ name: 'Instagram', href: socials.instagram, icon: 'instagram' }]
			: []),
		...(socials?.facebook ? [{ name: 'Facebook', href: socials.facebook, icon: 'facebook' }] : []),
		...(socials?.youtube ? [{ name: 'YouTube', href: socials.youtube, icon: 'youtube' }] : [])
	];

	return (
		<nav
			className={clsx(
				'fixed right-0 left-0 z-50 hidden lg:block',
				hasAnnouncements ? 'top-(--banner-height)' : 'top-4'
			)}
		>
			<div className="container mx-auto flex flex-col items-center">
				<div
					className={clsx(
						'bg-brand w-full rounded-full px-8 py-4 transition-all duration-300',
						isScrolled
							? 'border-secondary border-2 shadow-[0_0_30px_rgba(198,146,20,0.4)]'
							: 'border-2 border-transparent shadow-[0_20px_60px_-15px_rgba(26,75,166,0.5)]'
					)}
				>
					<div className="flex items-center justify-between">
						{/* Logo/Brand */}
						<Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
							{logoUrl && (
								<Image
									src={logoUrl}
									alt={logoAlt || 'Club logo'}
									width={40}
									height={40}
									className="h-10 w-auto"
								/>
							)}

							<span className="text-neutral-content invisible hidden font-bold lg:block xl:visible xl:text-xl">
								{clubName}
							</span>
						</Link>

						{/* Main Navigation */}
						<ul className="flex items-center gap-1">
							{navItems.map((item) => {
								const isActive = pathname === item.href;
								const hasSubmenu = 'submenu' in item && item.submenu;
								const isSubmenuActive =
									hasSubmenu && item.submenu?.some((sub) => pathname === sub.href);
								const isDropdownOpen = openDropdown === item.name;

								if (hasSubmenu) {
									return (
										<li
											key={item.name}
											className="relative"
											ref={(el) => {
												dropdownRefs.current[item.name] = el;
											}}
										>
											<button
												onClick={() => toggleDropdown(item.name)}
												onKeyDown={(e) => handleDropdownKeyDown(e, item.name)}
												className={clsx(
													'flex items-center gap-1 px-4 py-2 whitespace-nowrap transition-colors md:text-sm xl:text-base',
													isActive || isSubmenuActive
														? 'text-secondary border-b-secondary border-b-2 font-bold'
														: 'text-neutral-content hover:bg-neutral-content/10 rounded-lg font-medium'
												)}
												aria-expanded={isDropdownOpen}
												aria-haspopup="true"
												aria-current={isActive || isSubmenuActive ? 'page' : undefined}
											>
												{item.name}
												<ChevronDown
													className={clsx(
														'ml-1 h-4 w-4 transition-transform duration-200',
														isDropdownOpen ? 'rotate-180' : 'rotate-0'
													)}
												/>
											</button>

											{isDropdownOpen && (
												<ul
													role="menu"
													className="bg-brand absolute top-full left-0 mt-6 min-w-40 animate-[dropdownSlide_0.2s_ease-out] rounded-2xl p-2 shadow-xl"
												>
													{item.submenu?.map((subItem, subIndex) => {
														const isSubActive = pathname === subItem.href;
														return (
															<li key={subItem.name} role="none">
																<Link
																	href={subItem.href}
																	role="menuitem"
																	ref={(el) => {
																		if (!menuItemRefs.current[item.name]) {
																			menuItemRefs.current[item.name] = [];
																		}
																		menuItemRefs.current[item.name][subIndex] = el;
																	}}
																	onClick={closeDropdown}
																	onKeyDown={(e) => handleMenuItemKeyDown(e, item.name, subIndex)}
																	className={clsx(
																		'block rounded-xl p-4 whitespace-nowrap transition-all duration-200 md:text-sm xl:text-base',
																		isSubActive
																			? 'bg-secondary/10 text-secondary font-bold'
																			: 'text-neutral-content hover:bg-neutral-content/10 hover:text-secondary font-medium'
																	)}
																	aria-current={isSubActive ? 'page' : undefined}
																>
																	{subItem.name}
																</Link>
															</li>
														);
													})}
												</ul>
											)}
										</li>
									);
								}

								return (
									<li key={item.name}>
										<Link
											href={item.href}
											className={clsx(
												'px-4 py-2 whitespace-nowrap transition-colors md:text-sm xl:text-base',
												isActive
													? 'text-secondary border-b-secondary border-b-2 font-bold'
													: 'text-neutral-content hover:bg-neutral-content/10 rounded-lg font-medium'
											)}
											aria-current={isActive ? 'page' : undefined}
										>
											{item.name}
										</Link>
									</li>
								);
							})}
						</ul>

						{/* Search & Social Links */}
						<div className="flex items-center gap-2">
							<button
								onClick={openSearchModal}
								className="text-neutral-content hover:bg-neutral-content/10 rounded-full p-2 transition-colors"
								aria-label="Search"
								title="Search (⌘K)"
							>
								<Search className="h-5 w-5" />
							</button>
							{socialLinks.map((social) => (
								<a
									key={social.name}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-neutral-content hover:bg-neutral-content/10 rounded-full p-2 transition-colors"
									aria-label={social.name}
								>
									{social.icon === 'mapPin' ? (
										<MapPin className="h-5 w-5" />
									) : (
										<Icon
											name={social.icon as 'facebook' | 'instagram' | 'youtube'}
											className="h-5 w-5"
										/>
									)}
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
