import type { Metadata } from 'next';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getEditablePageMetadata, getPageData } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getEditablePageMetadata('termsPage');
}

export default async function TermsAndConditionsPage() {
	const pageData = await getPageData('termsPage');

	if (!pageData) {
		throw new Error('Terms & Conditions page is missing critical content');
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
