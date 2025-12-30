import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Ticket } from 'lucide-react';

type EventCardProps = {
	slug: string;
	title: string;
	excerpt: string;
	eventDate: string;
	location?: string;
	category: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
	requiresTickets?: boolean;
	isFree?: boolean;
	featured?: boolean;
};

const categoryLabels: Record<string, string> = {
	match: 'Match',
	training: 'Training',
	social: 'Social Event',
	fundraiser: 'Fundraiser',
	meeting: 'Meeting',
	other: 'Event'
};

export function EventCard({
	slug,
	title,
	excerpt,
	eventDate,
	location,
	category,
	featuredImage,
	requiresTickets = false,
	isFree = true,
	featured = false
}: EventCardProps) {
	const eventDateObj = new Date(eventDate);
	const formattedDate = eventDateObj.toLocaleDateString('en-AU', {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
	const formattedTime = eventDateObj.toLocaleTimeString('en-AU', {
		hour: 'numeric',
		minute: '2-digit'
	});

	return (
		<Link href={`/events/${slug}`} className="group">
			<div
				className={`card h-full overflow-hidden shadow-lg transition-all hover:shadow-xl ${
					featured ? 'relative bg-linear-to-br from-blue-900 to-slate-950' : 'bg-base-100'
				}`}
			>
				{featured && (
					<>
						<div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-800/20 blur-3xl" />
						<div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
					</>
				)}
				<figure className="relative aspect-video overflow-hidden">
					<Image
						src={featuredImage.url}
						alt={featuredImage.alt || title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</figure>
				<div className={`card-body relative p-6 ${featured ? 'text-white' : ''}`}>
					<div className="mb-2 flex items-center gap-2">
						{featured && (
							<div className="bg-secondary inline-block w-fit rounded px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
								Featured
							</div>
						)}
						<div
							className={`inline-block w-fit rounded px-3 py-1 text-xs font-bold tracking-wide uppercase ${
								featured ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
							}`}
						>
							{categoryLabels[category] || category}
						</div>
					</div>

					<h3 className="card-title line-clamp-2 text-xl font-bold">{title}</h3>
					<p className={`line-clamp-2 ${featured ? 'text-white/90' : 'text-base-content/70'}`}>
						{excerpt}
					</p>

					<div className="mt-4 space-y-2">
						<div className="flex items-center gap-2">
							<Calendar
								className={`h-4 w-4 ${featured ? 'text-white/80' : 'text-base-content/60'}`}
							/>
							<time
								dateTime={eventDateObj.toISOString()}
								className={`text-sm ${featured ? 'text-white/90' : 'text-base-content/80'}`}
							>
								{formattedDate} at {formattedTime}
							</time>
						</div>

						{location && (
							<div className="flex items-center gap-2">
								<MapPin
									className={`h-4 w-4 ${featured ? 'text-white/80' : 'text-base-content/60'}`}
								/>
								<span className={`text-sm ${featured ? 'text-white/90' : 'text-base-content/80'}`}>
									{location}
								</span>
							</div>
						)}

						{requiresTickets && (
							<div className="flex items-center gap-2">
								<Ticket
									className={`h-4 w-4 ${featured ? 'text-white/80' : 'text-base-content/60'}`}
								/>
								<span
									className={`text-sm font-medium ${featured ? 'text-white' : isFree ? 'text-success' : 'text-primary'}`}
								>
									{isFree ? 'Free Event' : 'Tickets Required'}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
