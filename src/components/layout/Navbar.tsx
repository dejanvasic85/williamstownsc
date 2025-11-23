import { DesktopNavbar } from './DesktopNavbar';
import { MobileNavbar } from './MobileNavbar';

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
	return (
		<>
			<MobileNavbar />
			<DesktopNavbar
				logoUrl={logoUrl}
				logoAlt={logoAlt}
				clubName={clubName}
				socials={socials}
				homeGroundLink={homeGroundLink}
			/>
		</>
	);
}
