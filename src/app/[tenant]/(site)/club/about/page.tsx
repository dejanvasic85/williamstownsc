import { type Metadata } from 'next';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getEditablePageMetadata, getPageData } from '@/lib/content/page';
import { getCurrentTenant } from '@/tenants/current';

export async function generateMetadata(): Promise<Metadata> {
	const tenant = await getCurrentTenant();
	return getEditablePageMetadata(tenant, 'aboutPage');
}

export default async function ClubAboutPage() {
	const tenant = await getCurrentTenant();
	const pageData = await getPageData(tenant, 'aboutPage');

	if (!pageData) {
		throw new Error('About page is missing critical content');
	}

	return (
		<PageContainer
			tenant={tenant}
			heading={pageData.heading}
			featuredImage={pageData.featuredImage}
			intro={pageData.introduction}
			layout="article"
		>
			{pageData.body && pageData.body.length > 0 && (
				<PortableTextContent blocks={pageData.body} sanity={tenant.sanity} />
			)}
		</PageContainer>
	);
}
