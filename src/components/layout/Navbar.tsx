'use client';

import { BrandIcon } from '@/components/BrandIcon';
import clsx from 'clsx';
import { Home, MapPin, Menu, Newspaper, Search, Volleyball } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mobileNavItems = [
	{ name: 'Home', href: '/', icon: Home },
	{ name: 'News', href: '/news', icon: Newspaper },
	{ name: 'Football', href: '/football', icon: Volleyball },
	{ name: 'Menu', href: '/menu', icon: Menu }
];

const desktopNavItems = [
	{ name: 'Home', href: '/' },
	{ name: 'News', href: '/news' },
	{ name: 'Football', href: '/football' },
	{ name: 'Club', href: '/club' },
	{ name: 'Sponsors', href: '/sponsors' },
	{ name: 'Contact', href: '/contact' },
	{ name: 'Events', href: '/events' },
	{ name: 'Join us', href: '/join' }
];

type NavbarProps = {
	logoUrl?: string;
	logoAlt?: string;
	clubName?: string;
	socials?: {
		facebook?: string;
		instagram?: string;
		youtube?: string;
	};
	homeGroundLink?: string;
};

export function Navbar({ logoUrl, logoAlt, clubName, socials, homeGroundLink }: NavbarProps) {
	const pathname = usePathname();

	const socialLinks = [
		...(homeGroundLink ? [{ name: 'Home Ground', href: homeGroundLink, icon: 'mapPin' }] : []),
		...(socials?.instagram
			? [{ name: 'Instagram', href: socials.instagram, icon: 'instagram' }]
			: []),
		...(socials?.facebook ? [{ name: 'Facebook', href: socials.facebook, icon: 'facebook' }] : []),
		...(socials?.youtube ? [{ name: 'YouTube', href: socials.youtube, icon: 'youtube' }] : [])
	];

	return (
		<>
			{/* Mobile Bottom Navigation */}
			<nav className="fixed right-4 bottom-4 left-4 z-50 lg:hidden">
				<div className="bg-primary mx-auto max-w-md rounded-full px-6 py-3 shadow-2xl backdrop-blur-md">
					<ul className="flex items-center justify-around gap-2">
						{mobileNavItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;
							return (
								<li key={item.name}>
									<Link
										href={item.href}
										className={clsx(
											'flex flex-col items-center gap-1 rounded-full px-4 py-4 transition-colors',
											isActive
												? 'bg-secondary text-primary'
												: 'text-neutral-content hover:bg-neutral-content/10'
										)}
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

			{/* Desktop Navigation */}
			<nav className="fixed top-4 right-0 left-0 z-50 hidden lg:block">
				<div className="bg-primary container mx-auto rounded-full px-8 py-4 shadow-2xl backdrop-blur-md">
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
							{desktopNavItems.map((item) => {
								const isActive = pathname === item.href;
								return (
									<li key={item.name}>
										<Link
											href={item.href}
											className={clsx(
												'px-4 py-2 transition-colors md:text-sm xl:text-base',
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
								className="text-neutral-content hover:bg-neutral-content/10 rounded-full p-2 transition-colors"
								aria-label="Search"
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
										<BrandIcon
											name={social.icon as 'facebook' | 'instagram' | 'youtube'}
											className="h-5 w-5"
										/>
									)}
								</a>
							))}
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}
