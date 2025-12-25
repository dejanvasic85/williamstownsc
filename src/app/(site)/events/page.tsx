import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('eventsPage');
}

export default function EventsPage() {
	return <PageContainer heading="Events" />;
}
