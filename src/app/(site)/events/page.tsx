import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { generateStaticMetadata } from '@/lib/metadata/staticMetadata';

export async function generateMetadata(): Promise<Metadata> {
	return generateStaticMetadata({
		title: 'Events',
		description:
			'Discover upcoming events at Williamstown Soccer Club including community gatherings, fundraisers, and club celebrations'
	});
}

export default function EventsPage() {
	return <PageContainer heading="Events" />;
}
