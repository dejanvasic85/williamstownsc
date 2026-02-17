import { NavItem } from '@/lib/navigation';
import { DesktopNavbar } from './DesktopNavbar';
import { MobileNavbar } from './MobileNavbar';

type NavbarProps = {
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

export function Navbar({
	navItems,
	logoUrl,
	logoAlt,
	clubName,
	socials,
	homeGroundLink,
	hasAnnouncements
}: NavbarProps) {
	return (
		<>
			<MobileNavbar />
			<DesktopNavbar
				navItems={navItems}
				logoUrl={logoUrl}
				logoAlt={logoAlt}
				clubName={clubName}
				socials={socials}
				homeGroundLink={homeGroundLink}
				hasAnnouncements={hasAnnouncements}
			/>
		</>
	);
}
