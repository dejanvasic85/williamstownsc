import { Icon } from '@/components/Icon';
import Link from 'next/link';

type FooterProps = {
	clubName?: string;
	socials?: {
		facebook?: string;
		instagram?: string;
		youtube?: string;
	};
};

const currentYear = new Date().getFullYear();

export function Footer({ clubName, socials }: FooterProps) {
	return (
		<footer className="bg-base-300 text-base-content/80 mt-auto">
			<div className="mx-auto max-w-7xl px-4 py-12">
				{/* Navigation Grid */}
				<nav className="mb-8 grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
					{/* Navigation Column */}
					<div>
						<h3 className="text-base-content mb-3 font-semibold">Navigation</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/" className="hover:text-base-content transition-colors">
									Home
								</Link>
							</li>
							<li>
								<Link href="/news" className="hover:text-base-content transition-colors">
									News
								</Link>
							</li>
							<li>
								<Link href="/sponsors" className="hover:text-base-content transition-colors">
									Sponsors
								</Link>
							</li>
							<li>
								<Link href="/events" className="hover:text-base-content transition-colors">
									Events
								</Link>
							</li>
						</ul>
					</div>

					{/* Football Column */}
					<div>
						<h3 className="text-base-content mb-3 font-semibold">Football</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/football/teams" className="hover:text-base-content transition-colors">
									Teams
								</Link>
							</li>
							<li>
								<Link
									href="/football/programs"
									className="hover:text-base-content transition-colors"
								>
									Programs
								</Link>
							</li>
							<li>
								<Link
									href="/football/merchandise"
									className="hover:text-base-content transition-colors"
								>
									Merchandise
								</Link>
							</li>
						</ul>
					</div>

					{/* Club Column */}
					<div>
						<h3 className="text-base-content mb-3 font-semibold">Club</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/club/about" className="hover:text-base-content transition-colors">
									About
								</Link>
							</li>
							<li>
								<Link
									href="/club/organizations"
									className="hover:text-base-content transition-colors"
								>
									History
								</Link>
							</li>
							<li>
								<Link
									href="/club/organizations"
									className="hover:text-base-content transition-colors"
								>
									Committee
								</Link>
							</li>
							<li>
								<Link
									href="/club/policies-and-regulations"
									className="hover:text-base-content transition-colors"
								>
									Policies
								</Link>
							</li>
							<li>
								<Link href="/club/locations" className="hover:text-base-content transition-colors">
									Locations
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Column */}
					<div>
						<h3 className="text-base-content mb-3 font-semibold">Contact</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/contact" className="hover:text-base-content transition-colors">
									Get in Touch
								</Link>
							</li>
						</ul>
						{/* Social Media Links */}
						{socials && (socials.facebook || socials.instagram || socials.youtube) && (
							<div className="mt-4 flex gap-4">
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
					<span className="text-base-content/40">|</span>
					<Link href="/terms" className="hover:text-base-content transition-colors">
						Terms & Conditions
					</Link>
					<span className="text-base-content/40">|</span>
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
