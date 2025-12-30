import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Event } from '@/sanity/sanity.types';

export type TransformedEvent = Pick<Event, '_id' | 'featured' | 'requiresTickets' | 'isFree'> & {
	title: string;
	slug: string;
	eventDate: string;
	endDate?: string;
	location?: string;
	category: string;
	featuredImage: {
		url: string;
		alt?: string;
	};
	excerpt: string;
	eventUrl?: string;
};

export type EventDetail = TransformedEvent & {
	description: Event['description'];
};

export async function getUpcomingEvents(limit: number = 20): Promise<TransformedEvent[]> {
	const now = new Date().toISOString();
	const query = `*[_type == "event" && published == true && eventDate >= $now] | order(eventDate asc) [0...${limit}] {
		_id,
		title,
		slug,
		eventDate,
		endDate,
		location,
		category,
		featuredImage,
		excerpt,
		requiresTickets,
		eventUrl,
		isFree,
		featured
	}`;

	const events = await client.fetch<Event[]>(query, { now }, { next: { tags: ['event'] } });

	return events.map(
		(event): TransformedEvent => ({
			_id: event._id,
			title: event.title || '',
			slug: event.slug?.current || '',
			eventDate: event.eventDate || '',
			endDate: event.endDate,
			location: event.location,
			category: event.category || 'other',
			featuredImage: {
				url: event.featuredImage ? urlFor(event.featuredImage).width(800).height(600).url() : '',
				alt: event.featuredImage?.alt
			},
			excerpt: event.excerpt || '',
			requiresTickets: event.requiresTickets || false,
			eventUrl: event.eventUrl,
			isFree: event.isFree ?? true,
			featured: event.featured || false
		})
	);
}

export async function getFeaturedEvents(limit: number = 3): Promise<TransformedEvent[]> {
	const now = new Date().toISOString();
	const query = `*[_type == "event" && published == true && featured == true && eventDate >= $now] | order(eventDate asc) [0...${limit}] {
		_id,
		title,
		slug,
		eventDate,
		endDate,
		location,
		category,
		featuredImage,
		excerpt,
		requiresTickets,
		eventUrl,
		isFree,
		featured
	}`;

	const events = await client.fetch<Event[]>(query, { now }, { next: { tags: ['event'] } });

	return events.map(
		(event): TransformedEvent => ({
			_id: event._id,
			title: event.title || '',
			slug: event.slug?.current || '',
			eventDate: event.eventDate || '',
			endDate: event.endDate,
			location: event.location,
			category: event.category || 'other',
			featuredImage: {
				url: event.featuredImage ? urlFor(event.featuredImage).width(1920).height(1080).url() : '',
				alt: event.featuredImage?.alt
			},
			excerpt: event.excerpt || '',
			requiresTickets: event.requiresTickets || false,
			eventUrl: event.eventUrl,
			isFree: event.isFree ?? true,
			featured: event.featured || false
		})
	);
}

export async function getEventsByCategory(
	category: string,
	limit: number = 20
): Promise<TransformedEvent[]> {
	const now = new Date().toISOString();
	const query = `*[_type == "event" && published == true && category == $category && eventDate >= $now] | order(eventDate asc) [0...${limit}] {
		_id,
		title,
		slug,
		eventDate,
		endDate,
		location,
		category,
		featuredImage,
		excerpt,
		requiresTickets,
		eventUrl,
		isFree,
		featured
	}`;

	const events = await client.fetch<Event[]>(
		query,
		{ category, now },
		{ next: { tags: ['event'] } }
	);

	return events.map(
		(event): TransformedEvent => ({
			_id: event._id,
			title: event.title || '',
			slug: event.slug?.current || '',
			eventDate: event.eventDate || '',
			endDate: event.endDate,
			location: event.location,
			category: event.category || 'other',
			featuredImage: {
				url: event.featuredImage ? urlFor(event.featuredImage).width(800).height(600).url() : '',
				alt: event.featuredImage?.alt
			},
			excerpt: event.excerpt || '',
			requiresTickets: event.requiresTickets || false,
			eventUrl: event.eventUrl,
			isFree: event.isFree ?? true,
			featured: event.featured || false
		})
	);
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
	const query = `*[_type == "event" && slug.current == $slug][0] {
		_id,
		title,
		slug,
		eventDate,
		endDate,
		location,
		category,
		featuredImage,
		excerpt,
		description,
		requiresTickets,
		eventUrl,
		isFree,
		featured
	}`;

	const event = await client.fetch<Event>(query, { slug }, { next: { tags: ['event'] } });

	if (!event) {
		return null;
	}

	return {
		_id: event._id,
		title: event.title || '',
		slug: event.slug?.current || '',
		eventDate: event.eventDate || '',
		endDate: event.endDate,
		location: event.location,
		category: event.category || 'other',
		featuredImage: {
			url: event.featuredImage ? urlFor(event.featuredImage).width(1920).height(1080).url() : '',
			alt: event.featuredImage?.alt
		},
		excerpt: event.excerpt || '',
		description: event.description,
		requiresTickets: event.requiresTickets || false,
		eventUrl: event.eventUrl,
		isFree: event.isFree ?? true,
		featured: event.featured || false
	};
}
