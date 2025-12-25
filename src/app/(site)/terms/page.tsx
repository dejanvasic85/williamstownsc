import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('termsPage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		robots: metadata.robots
	};
}

export default function TermsAndConditionsPage() {
	return <PageContainer heading="Terms & Conditions" />;
}
