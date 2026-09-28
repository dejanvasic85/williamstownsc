import type { Metadata } from 'next';
import { CommitteeMemberGrid } from '@/components/committee';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getCommitteePageData } from '@/lib/content/committeePage';
import { getEditablePageMetadata } from '@/lib/content/page';
import { getCurrentTenant } from '@/tenants/current';

export async function generateMetadata(): Promise<Metadata> {
	const tenant = await getCurrentTenant();
	return getEditablePageMetadata(tenant, 'committeePage');
}

export default async function ClubOrganizationsPage() {
	const tenant = await getCurrentTenant();
	const pageData = await getCommitteePageData(tenant);

	if (!pageData) {
		throw new Error('Page is missing critical content');
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

			{pageData.committeeMembers && pageData.committeeMembers.length > 0 && (
				<div className="mt-16">
					<CommitteeMemberGrid members={pageData.committeeMembers} sanity={tenant.sanity} />
				</div>
			)}
		</PageContainer>
	);
}
