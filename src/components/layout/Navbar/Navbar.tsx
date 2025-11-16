'use client';

import { Home, Newspaper, Volleyball, Menu, Search, MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { BrandIcon } from '@/components/BrandIcon';

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
	{ name: 'Play', href: '/play' }
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
			<nav className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
				<div className="mx-auto max-w-md rounded-full bg-primary px-6 py-3 shadow-2xl backdrop-blur-md">
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
												? 'bg-secondary text-primary'
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

			{/* Desktop Navigation */}
			<nav className="fixed top-4 left-0 right-0 z-50 hidden lg:block">
				<div className="container mx-auto rounded-full bg-primary px-8 py-4 shadow-2xl backdrop-blur-md">
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

							<span className="font-bold text-neutral-content hidden xl:text-xl lg:block invisible xl:visible">
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
											className={`md:text-sm xl:text-base px-4 py-2 transition-colors ${
												isActive
													? 'text-secondary font-bold border-b-2 border-b-secondary'
													: 'rounded-lg text-neutral-content font-medium hover:bg-neutral-content/10'
											}`}
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
								className="rounded-full p-2 text-neutral-content transition-colors hover:bg-neutral-content/10"
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
									className="rounded-full p-2 text-neutral-content transition-colors hover:bg-neutral-content/10"
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
