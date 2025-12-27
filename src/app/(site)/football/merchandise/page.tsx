import { type Metadata } from 'next';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getEditablePageMetadata, getPageData } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getEditablePageMetadata('merchandisePage');
}

export default async function FootballMerchandisePage() {
	const pageData = await getPageData('merchandisePage');

	if (!pageData) {
		throw new Error('Merchandise page is missing critical content');
	}

	return (
		<PageContainer
			heading={pageData.heading}
			featuredImage={pageData.featuredImage}
			intro={pageData.introduction}
			layout="article"
		>
			{pageData.body && pageData.body.length > 0 && <PortableTextContent blocks={pageData.body} />}
		</PageContainer>
	);
}
