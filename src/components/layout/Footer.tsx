import Link from 'next/link';
import clsx from 'clsx';
import { Icon } from '@/components/Icon';
import { FooterNavLinks } from '@/lib/navigationTransformer';

type FooterProps = {
	clubName?: string;
	socials?: {
		facebook?: string;
		instagram?: string;
		youtube?: string;
	};
	navLinks: FooterNavLinks;
};

const currentYear = new Date().getFullYear();

export function Footer({ clubName, socials, navLinks }: FooterProps) {
	return (
		<footer className="bg-base-300 mt-auto text-(--color-base-content-secondary)">
			<div className="mx-auto max-w-7xl px-4 py-12">
				{/* Navigation Grid */}
				<nav className="mb-8 grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
					{/* Navigation Column */}
					{navLinks.navigation.length > 0 && (
						<div>
							<h3 className="text-base-content mb-3 font-semibold">Navigation</h3>
							<ul className="space-y-2">
								{navLinks.navigation.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className="hover:text-base-content transition-colors">
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Football Column */}
					{navLinks.football.length > 0 && (
						<div>
							<h3 className="text-base-content mb-3 font-semibold">Football</h3>
							<ul className="space-y-2">
								{navLinks.football.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className="hover:text-base-content transition-colors">
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Club Column */}
					{navLinks.club.length > 0 && (
						<div>
							<h3 className="text-base-content mb-3 font-semibold">Club</h3>
							<ul className="space-y-2">
								{navLinks.club.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className="hover:text-base-content transition-colors">
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Contact Column */}
					<div>
						{navLinks.contact.length > 0 && (
							<>
								<h3 className="text-base-content mb-3 font-semibold">Contact</h3>
								<ul className="space-y-2">
									{navLinks.contact.map((link) => (
										<li key={link.href}>
											<Link href={link.href} className="hover:text-base-content transition-colors">
												{link.name}
											</Link>
										</li>
									))}
								</ul>
							</>
						)}
						{/* Social Media Links */}
						{socials && (socials.facebook || socials.instagram || socials.youtube) && (
							<div className={clsx('flex gap-4', navLinks.contact.length > 0 && 'mt-4')}>
								{socials.facebook && (
									<a
										href={socials.facebook}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-base-content transition-colors"
										aria-label="Facebook"
									>
										<Icon name="facebook" className="h-6 w-6" />
									</a>
								)}
								{socials.instagram && (
									<a
										href={socials.instagram}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-base-content transition-colors"
										aria-label="Instagram"
									>
										<Icon name="instagram" className="h-6 w-6" />
									</a>
								)}
								{socials.youtube && (
									<a
										href={socials.youtube}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-base-content transition-colors"
										aria-label="YouTube"
									>
										<Icon name="youtube" className="h-6 w-6" />
									</a>
								)}
							</div>
						)}
					</div>
				</nav>

				{/* Legal Links */}
				<div className="mb-6 flex flex-wrap justify-center gap-4 text-sm">
					<Link href="/privacy" className="hover:text-base-content transition-colors">
						Privacy Policy
					</Link>
					<span className="text-(--color-base-content-secondary)" aria-hidden="true">
						|
					</span>
					<Link href="/terms" className="hover:text-base-content transition-colors">
						Terms & Conditions
					</Link>
					<span className="text-(--color-base-content-secondary)" aria-hidden="true">
						|
					</span>
					<Link href="/accessibility" className="hover:text-base-content transition-colors">
						Accessibility
					</Link>
				</div>

				{/* Bottom Section */}
				<div className="border-base-content/10 space-y-2 border-t pt-6 text-center text-sm">
					<p>
						© {currentYear} {clubName || 'Williamstown SC'}. All rights reserved.
					</p>
					<p>
						Developed by{' '}
						<a
							href="https://dejan.vasic.com.au"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-base-content font-medium transition-colors"
						>
							Dejan Vasic
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
