import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('policiesPage');
}

export default function ClubPoliciesPage() {
	return <PageContainer heading="Policies and Regulations" layout="article" />;
}
