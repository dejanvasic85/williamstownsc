import type { Metadata } from 'next';
import { CommitteeMemberGrid } from '@/components/committee';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getCommitteePageData } from '@/lib/content/committeePage';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('committeePage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		twitter: metadata.twitter,
		robots: metadata.robots
	};
}

export default async function ClubOrganizationsPage() {
	const pageData = await getCommitteePageData();

	if (!pageData) {
		throw new Error('Page is missing critical content');
	}

	return (
		<PageContainer
			heading={pageData.heading}
			featuredImage={pageData.featuredImage}
			intro={pageData.introduction}
			layout="article"
		>
			{pageData.body && pageData.body.length > 0 && <PortableTextContent blocks={pageData.body} />}

			{pageData.committeeMembers && pageData.committeeMembers.length > 0 && (
				<div className="mt-16">
					<CommitteeMemberGrid members={pageData.committeeMembers} />
				</div>
			)}
		</PageContainer>
	);
}
