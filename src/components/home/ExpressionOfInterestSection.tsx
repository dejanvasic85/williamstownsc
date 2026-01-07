import Link from 'next/link';
import { ShieldCheck, UserPlus } from 'lucide-react';

export function ExpressionOfInterestSection() {
	return (
		<section className="container mx-auto px-4">
			<div className="bg-base-200 flex flex-col gap-10 rounded-2xl p-8 shadow-xl md:p-12">
				<div className="text-center">
					<h2 className="mb-3 text-3xl font-bold md:text-4xl">Join Our Club</h2>
					<p className="text-base-content/70 mx-auto max-w-2xl text-lg">
						{`Whether you want to play or help shape the next generation of players, we'd love to hear
						from you.`}
					</p>
				</div>

				<div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
					<Link
						href="/contact?type=player"
						className="group bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40 flex flex-col items-center rounded-xl border-2 p-8 text-center transition-all duration-300"
					>
						<div className="bg-primary/10 group-hover:bg-primary/20 mb-4 rounded-full p-4 transition-colors">
							<UserPlus className="text-primary h-10 w-10" />
						</div>
						<h3 className="text-primary mb-3 text-2xl font-bold">Register to Play</h3>
						<p className="text-base-content/70 mb-4">
							Join our teams and be part of the action. All skill levels welcome.
						</p>
						<span className="btn btn-primary btn-outline group-hover:btn-primary-focus mt-auto">
							Express interest in playing
						</span>
					</Link>

					<Link
						href="/contact?type=coach"
						className="group dark:bg-surface dark:border-secondary bg-secondary/5 dark:hover:bg-surface hover:bg-secondary/10 border-secondary/20 hover:border-secondary/40 flex flex-col items-center rounded-xl border p-8 text-center transition-all duration-300"
					>
						<div className="bg-secondary/10 group-hover:bg-secondary/20 mb-4 rounded-full p-4 transition-colors">
							<ShieldCheck className="text-secondary h-10 w-10" />
						</div>
						<h3 className="text-secondary mb-3 text-2xl font-bold">Become a Coach</h3>
						<p className="text-base-content/90 mb-4">
							Share your passion and experience. Help develop future stars.
						</p>
						<span className="btn btn-secondary group-hover:btn-secondary-focus mt-auto">
							Express interest in coaching
						</span>
					</Link>
				</div>

				<div className="text-center">
					<h3 className="mb-4 text-3xl font-bold">Become a sponsor</h3>
					<p className="text-base-content/70 mx-auto mb-8 max-w-2xl text-lg">
						Support our club and gain visibility in the local community. We offer various
						sponsorship packages to suit your needs.
					</p>
					<Link href="/contact?type=sponsorship" className="btn btn-outline btn-lg btn-primary">
						Become a sponsor
					</Link>
				</div>
			</div>
		</section>
	);
}
