import Image from 'next/image';
import clsx from 'clsx';
import { PageContainer } from '@/components/layout';
import { getAllSponsors } from '@/lib/content';

export default async function SponsorsPage() {
	const sponsors = await getAllSponsors();
	return (
		<PageContainer
			heading="Our Sponsors"
			intro="We are grateful for the support of our sponsors who help make our club possible."
		>
			{/* All Sponsors */}
			<div className="mb-16 flex flex-col items-center gap-8">
				{sponsors.map((sponsor, index) => {
					const isEven = index % 2 === 0;
					return (
						<div
							key={sponsor._id}
							className="group relative w-full overflow-hidden rounded-3xl bg-white transition-all md:w-8/12"
						>
							<div className="relative flex flex-col items-start md:flex-row">
								{/* Content - Always order-1 on mobile, alternates on desktop */}
								<div
									className={`order-1 flex w-full flex-col p-8 md:w-3/5 ${
										isEven ? 'md:order-2' : 'md:order-1'
									}`}
								>
									<div className="mb-2 flex items-center gap-3">
										<h3 className="text-2xl font-bold md:text-xl xl:text-2xl">{sponsor.name}</h3>
										<div
											className={clsx(
												'badge text-sm font-semibold',
												sponsor.type === 'Principal' && 'badge-secondary'
											)}
										>
											{sponsor.type}
										</div>
									</div>
									<p className="text-base-content/70 mb-4 text-base md:text-sm xl:text-base">
										{sponsor.description}
									</p>

									{sponsor.website && (
										<div>
											<a
												href={sponsor.website}
												target="_blank"
												rel="noopener noreferrer"
												className="btn btn-primary btn-outline"
											>
												Visit Website
											</a>
										</div>
									)}
								</div>

								{/* Logo - Always order-2 on mobile (bottom), alternates on desktop */}
								<div
									className={`order-2 flex w-full items-center justify-center p-6 md:w-2/5 md:p-8 ${
										isEven ? 'md:order-1' : 'md:order-2'
									}`}
								>
									<div className="flex h-40 w-full max-w-64 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-md md:h-48">
										<Image
											src={sponsor.logo.url}
											alt={sponsor.logo.alt || `${sponsor.name} logo`}
											width={400}
											height={300}
											className="h-full w-full object-contain"
										/>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Become a Sponsor */}
			<section className="from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden rounded-2xl bg-linear-to-br p-8 shadow-xl md:p-12">
				<div className="bg-primary/20 absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl" />
				<div className="bg-secondary/20 absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-3xl" />

				<div className="relative">
					<h2 className="mb-4 text-center text-3xl font-bold">Become a Sponsor</h2>
					<p className="text-base-content/70 mx-auto mb-10 max-w-3xl text-center text-lg">
						Williamstown SC offers a range of sponsorship opportunities to help your business
						connect with our community. Our sponsorship packages provide excellent visibility and
						demonstrate your commitment to local sport.
					</p>

					<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all">
							<div className="from-primary/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Principal Sponsor</h3>
								<p className="text-base-content/70">
									Maximum exposure across all club activities, signage, and communications.
								</p>
							</div>
						</div>
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
							<div className="from-secondary/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Major Sponsor</h3>
								<p className="text-base-content/70">
									Prominent branding on team uniforms and major event sponsorship opportunities.
								</p>
							</div>
						</div>
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
							<div className="from-accent/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Community Partner</h3>
								<p className="text-base-content/70">
									Support specific programs or age groups while building local connections.
								</p>
							</div>
						</div>
					</div>

					<div className="text-center">
						<p className="mb-4 text-lg font-semibold">Interested in sponsoring our club?</p>
						<a
							href="mailto:sponsorship@williamstownsc.com.au"
							className="btn btn-primary btn-lg shadow-lg"
						>
							Become a sponsor
						</a>
					</div>
				</div>
			</section>
		</PageContainer>
	);
}
