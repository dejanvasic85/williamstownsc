import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('locationsPage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		robots: metadata.robots
	};
}

export default function ClubLocationsPage() {
	return <PageContainer heading="Club Locations" />;
}
