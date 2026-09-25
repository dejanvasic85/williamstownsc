import { type Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { PageContainer } from '@/components/layout';
import { type ContactType, contactTypes } from '@/lib/contact/contactEmail';
import { getActivePrograms } from '@/lib/content';
import { getContactPageData, getEditablePageMetadata } from '@/lib/content/page';
import { getCurrentTenant } from '@/tenants/current';

export async function generateMetadata(): Promise<Metadata> {
	const tenant = await getCurrentTenant();
	return getEditablePageMetadata(tenant, 'contactPage');
}

type ContactPageProps = {
	searchParams: Promise<{ type?: string; name?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
	const params = await searchParams;
	const tenant = await getCurrentTenant();
	const pageData = await getContactPageData(tenant);
	const programs = await getActivePrograms(tenant);

	if (!pageData) {
		throw new Error('Contact page is missing critical content');
	}

	// Validate and get the contact type from URL
	const initialType: ContactType = contactTypes.includes(params.type as ContactType)
		? (params.type as ContactType)
		: 'general';

	const programsForForm = programs
		.filter((p) => p.name)
		.map((p) => ({ _id: p._id, name: p.name as string }));

	// Build type content map
	const typeContentMap = {
		player: pageData.playerContent,
		coach: pageData.coachContent,
		sponsor: pageData.sponsorContent,
		program: pageData.programContent,
		general: pageData.generalContent
	};

	return (
		<PageContainer
			tenant={tenant}
			heading={pageData.heading}
			intro={pageData.introduction}
			layout="article"
		>
			<ContactForm
				initialType={initialType}
				initialProgramName={params.name}
				programs={programsForForm}
				sanity={tenant.sanity}
				typeContentMap={typeContentMap}
			/>
		</PageContainer>
	);
}
