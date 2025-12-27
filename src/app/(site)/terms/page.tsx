import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('termsPage');
}

export default function TermsAndConditionsPage() {
	return <PageContainer heading="Terms & Conditions" />;
}
