import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('privacyPage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		twitter: metadata.twitter,
		robots: metadata.robots
	};
}

export default function PrivacyPolicyPage() {
	return <PageContainer heading="Privacy Policy" />;
}
