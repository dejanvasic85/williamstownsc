import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ExternalLink, MapPin, Ticket } from 'lucide-react';
import { PortableText } from 'next-sanity';
import { PageContainer } from '@/components/layout';
import { getEventBySlug, getSiteSettings } from '@/lib/content';
import { buildUrl, getRequestBaseUrl } from '@/lib/url';
import { urlFor } from '@/sanity/lib/image';

type EventPageProps = {
	params: Promise<{ slug: string }>;
};

const categoryLabels: Record<string, string> = {
	match: 'Match',
	training: 'Training',
	social: 'Social Event',
	fundraiser: 'Fundraiser',
	meeting: 'Meeting',
	other: 'Event'
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
	const { slug } = await params;
	const event = await getEventBySlug(slug);
	const siteSettings = await getSiteSettings();

	if (!event) {
		notFound();
	}

	if (!siteSettings.canonicalUrl) {
		throw new Error('canonicalUrl is required');
	}

	const eventCanonicalUrl = buildUrl(siteSettings.canonicalUrl, 'events', event.slug);
	const requestBaseUrl = await getRequestBaseUrl();
	const eventRequestUrl = buildUrl(requestBaseUrl, 'events', event.slug);

	return {
		title: event.title,
		description: event.excerpt,
		alternates: {
			canonical: eventCanonicalUrl
		},
		openGraph: {
			type: 'article',
			siteName: siteSettings.clubName,
			title: event.title,
			description: event.excerpt,
			url: eventRequestUrl,
			images: [
				{
					url: event.featuredImage.url,
					width: 1920,
					height: 1080,
					alt: event.featuredImage.alt || event.title
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title: event.title,
			description: event.excerpt,
			images: [event.featuredImage.url]
		}
	};
}

export default async function EventPage({ params }: EventPageProps) {
	const { slug } = await params;
	const event = await getEventBySlug(slug);
	const siteSettings = await getSiteSettings();

	if (!event) {
		notFound();
	}

	if (!siteSettings.canonicalUrl) {
		throw new Error('canonicalUrl is required');
	}

	const eventDateObj = new Date(event.eventDate);
	const endDateObj = event.endDate ? new Date(event.endDate) : null;

	const formattedDate = eventDateObj.toLocaleDateString('en-AU', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	const formattedTime = eventDateObj.toLocaleTimeString('en-AU', {
		hour: 'numeric',
		minute: '2-digit'
	});

	const formattedEndDate = endDateObj
		? endDateObj.toLocaleDateString('en-AU', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
		: null;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: event.title,
		description: event.excerpt,
		image: event.featuredImage.url,
		startDate: event.eventDate,
		...(event.endDate && { endDate: event.endDate }),
		...(event.location && { location: { '@type': 'Place', name: event.location } }),
		organizer: {
			'@type': 'Organization',
			name: siteSettings.clubName,
			url: siteSettings.canonicalUrl
		},
		...(event.requiresTickets &&
			event.eventUrl && {
				offers: {
					'@type': 'Offer',
					url: event.eventUrl,
					price: event.isFree ? '0' : undefined,
					priceCurrency: 'AUD',
					availability: 'https://schema.org/InStock'
				}
			})
	};

	return (
		<PageContainer layout="article">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<article>
				<div className="mb-8">
					<div className="mb-4 flex flex-wrap items-center gap-2">
						<div className="bg-primary/10 text-primary inline-block rounded px-3 py-1 text-sm font-bold uppercase">
							{categoryLabels[event.category] || event.category}
						</div>
						{event.isFree && event.requiresTickets && (
							<div className="bg-success/10 text-success inline-block rounded px-3 py-1 text-sm font-bold uppercase">
								Free Event
							</div>
						)}
					</div>

					<h1 className="mb-6 text-3xl font-bold lg:text-4xl">{event.title}</h1>

					<div className="text-base-content/80 space-y-3 text-lg">
						<div className="flex items-center gap-3">
							<Calendar className="text-primary h-5 w-5" />
							<div>
								<time dateTime={eventDateObj.toISOString()}>
									{formattedDate} at {formattedTime}
								</time>
								{endDateObj && formattedEndDate && (
									<>
										<span className="mx-2">→</span>
										<time dateTime={endDateObj.toISOString()}>{formattedEndDate}</time>
									</>
								)}
							</div>
						</div>

						{event.location && (
							<div className="flex items-center gap-3">
								<MapPin className="text-primary h-5 w-5" />
								<span>{event.location}</span>
							</div>
						)}

						{event.requiresTickets && event.eventUrl && (
							<div className="flex items-center gap-3">
								<Ticket className="text-primary h-5 w-5" />
								<span>
									{event.isFree ? 'Free entry - Registration required' : 'Tickets required'}
								</span>
							</div>
						)}
					</div>
				</div>

				{event.requiresTickets && event.eventUrl && (
					<div className="mb-8">
						<Link
							href={event.eventUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-primary btn-lg inline-flex items-center gap-2"
						>
							<Ticket className="h-5 w-5" />
							{event.isFree ? 'Register for Free' : 'Get Tickets'}
							<ExternalLink className="h-4 w-4" />
						</Link>
					</div>
				)}

				{event.featuredImage.url && (
					<figure className="mb-8 overflow-hidden rounded-lg">
						<Image
							src={event.featuredImage.url}
							alt={event.featuredImage.alt || event.title}
							width={1920}
							height={1080}
							className="h-auto w-full object-cover"
							priority
						/>
					</figure>
				)}

				{event.description && (
					<div className="prose prose-lg max-w-none">
						<PortableText
							value={event.description}
							components={{
								types: {
									image: ({ value }) => {
										const imageUrl = value.asset ? urlFor(value.asset).width(1200).url() : '';
										return (
											<figure className="my-8">
												{imageUrl && (
													<Image
														src={imageUrl}
														alt={value.alt || ''}
														width={1200}
														height={800}
														className="h-auto w-full rounded-lg"
													/>
												)}
												{value.caption && (
													<figcaption className="text-base-content/60 mt-2 text-center text-sm">
														{value.caption}
													</figcaption>
												)}
											</figure>
										);
									}
								},
								block: {
									h1: ({ children }) => (
										<h1 className="mt-8 mb-4 text-3xl font-bold">{children}</h1>
									),
									h2: ({ children }) => (
										<h2 className="mt-8 mb-4 text-2xl font-bold">{children}</h2>
									),
									h3: ({ children }) => <h3 className="mt-6 mb-3 text-xl font-bold">{children}</h3>,
									h4: ({ children }) => <h4 className="mt-6 mb-3 text-lg font-bold">{children}</h4>,
									normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
									blockquote: ({ children }) => (
										<blockquote className="border-secondary my-6 border-l-4 pl-4 italic">
											{children}
										</blockquote>
									)
								},
								list: {
									bullet: ({ children }) => (
										<ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
									),
									number: ({ children }) => (
										<ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
									)
								},
								listItem: {
									bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
									number: ({ children }) => <li className="leading-relaxed">{children}</li>
								},
								marks: {
									strong: ({ children }) => <strong className="font-bold">{children}</strong>,
									em: ({ children }) => <em className="italic">{children}</em>,
									link: ({ value, children }) => {
										const target = value?.href?.startsWith('http') ? '_blank' : undefined;
										const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
										return (
											<a
												href={value?.href}
												target={target}
												rel={rel}
												className="text-secondary font-medium hover:underline"
											>
												{children}
											</a>
										);
									}
								}
							}}
						/>
					</div>
				)}

				{event.requiresTickets && event.eventUrl && (
					<div className="bg-base-200 mt-12 rounded-lg p-8 text-center">
						<h2 className="mb-4 text-2xl font-bold">Ready to attend?</h2>
						<p className="text-base-content/70 mb-6">
							{event.isFree
								? 'Register now to secure your spot at this free event'
								: 'Get your tickets now to secure your spot'}
						</p>
						<Link
							href={event.eventUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-primary btn-lg inline-flex items-center gap-2"
						>
							<Ticket className="h-5 w-5" />
							{event.isFree ? 'Register for Free' : 'Get Tickets'}
							<ExternalLink className="h-4 w-4" />
						</Link>
					</div>
				)}
			</article>
		</PageContainer>
	);
}
