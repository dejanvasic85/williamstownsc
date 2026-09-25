import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { KeyDatesTimeline } from '@/components/keyDates/KeyDatesTimeline';
import { PageContainer } from '@/components/layout';
import { getKeyDatesPageData } from '@/lib/content';
import { getEditablePageMetadata } from '@/lib/content/page';
import { getCurrentTenant } from '@/tenants/current';

export async function generateMetadata(): Promise<Metadata> {
	const tenant = await getCurrentTenant();
	return getEditablePageMetadata(tenant, 'keyDatesPage');
}

export default async function KeyDatesPage() {
	const tenant = await getCurrentTenant();
	const pageData = await getKeyDatesPageData(tenant);

	return (
		<PageContainer
			tenant={tenant}
			heading={pageData?.heading || 'Key Dates 2026'}
			featuredImage={pageData?.featuredImage}
			intro={pageData?.introduction}
			layout="article"
		>
			{pageData?.body && pageData.body.length > 0 && (
				<PortableTextContent blocks={pageData.body} sanity={tenant.sanity} />
			)}

			{pageData?.keyDates && pageData.keyDates.length > 0 && (
				<KeyDatesTimeline items={pageData.keyDates} />
			)}

			{(!pageData?.keyDates || pageData.keyDates.length === 0) && (
				<div className="bg-base-100 mt-10 rounded-xl p-12 text-center">
					<Calendar className="text-base-content/30 mx-auto h-16 w-16" />
					<p className="text-base-content/70 mt-4 text-lg">
						Key dates for the upcoming season will be announced soon.
					</p>
				</div>
			)}
		</PageContainer>
	);
}
