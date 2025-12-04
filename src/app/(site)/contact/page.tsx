import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getPageData, getPageMetadata } from '@/lib/content/page';
import { type Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('contactPage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		robots: metadata.robots
	};
}

export default async function ContactPage() {
	const pageData = await getPageData('contactPage');

	if (!pageData) {
		throw new Error('Contact page is missing critical content');
	}

	return (
		<PageContainer
			heading={pageData.heading}
			featuredImage={pageData.featuredImage}
			intro={pageData.introduction}
		>
			{pageData.body && pageData.body.length > 0 && <PortableTextContent blocks={pageData.body} />}
		</PageContainer>
	);
}
