import { type Metadata } from 'next';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getPageData, getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('merchandisePage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		robots: metadata.robots
	};
}

export default async function MerchandisePage() {
	const pageData = await getPageData('merchandisePage');

	if (!pageData) {
		throw new Error('Merchandise page is missing critical content');
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
