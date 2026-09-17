import { type Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { PageContainer } from '@/components/layout';
import { type ContactType, contactTypes } from '@/lib/contact/contactEmail';
import { getContactPageData, getEditablePageMetadata } from '@/lib/content/page';
import { getActivePrograms } from '@/sanity/services/programService';

export async function generateMetadata(): Promise<Metadata> {
	return getEditablePageMetadata('contactPage');
}

type ContactPageProps = {
	searchParams: Promise<{ type?: string; name?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
	const params = await searchParams;
	const pageData = await getContactPageData();
	const programs = await getActivePrograms();

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
		<PageContainer heading={pageData.heading} intro={pageData.introduction} layout="article">
			<ContactForm
				initialType={initialType}
				initialProgramName={params.name}
				programs={programsForForm}
				typeContentMap={typeContentMap}
			/>
		</PageContainer>
	);
}
