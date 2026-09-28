import type { Metadata } from 'next';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getEditablePageMetadata, getPageData } from '@/lib/content/page';
import { getCurrentTenant } from '@/tenants/current';

export async function generateMetadata(): Promise<Metadata> {
	const tenant = await getCurrentTenant();
	return getEditablePageMetadata(tenant, 'accessibilityPage');
}

export default async function AccessibilityPage() {
	const tenant = await getCurrentTenant();
	const pageData = await getPageData(tenant, 'accessibilityPage');

	if (!pageData) {
		throw new Error('Accessibility page is missing critical content');
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
