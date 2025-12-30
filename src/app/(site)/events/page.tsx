import type { Metadata } from 'next';
import { EventCard } from '@/components/events';
import { PageContainer } from '@/components/layout';
import { getUpcomingEvents } from '@/lib/content/events';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('eventsPage');
}

export default async function EventsPage() {
	const events = await getUpcomingEvents(20);

	return (
		<PageContainer heading="Events" intro="Check out our upcoming events, matches, and activities">
			{events.length > 0 && (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{events.map((event) => (
						<EventCard
							key={event._id}
							slug={event.slug}
							title={event.title}
							excerpt={event.excerpt}
							eventDate={event.eventDate}
							location={event.location}
							category={event.category}
							featuredImage={event.featuredImage}
							requiresTickets={event.requiresTickets}
							isFree={event.isFree}
							featured={event.featured}
						/>
					))}
				</div>
			)}

			{events.length === 0 && (
				<div className="py-24 text-center">
					<h2 className="text-base-content/70 mb-4 text-2xl font-bold">No upcoming events</h2>
					<p className="text-base-content/60">Check back soon for upcoming events and activities</p>
				</div>
			)}
		</PageContainer>
	);
}
