import { ContactForm } from '@/components/contact/ContactForm';
import { PageContainer } from '@/components/layout';
import { ContactType } from '@/lib/contact/contactEmail';
import { getContactPageData, getPageMetadata } from '@/lib/content/page';
import { getActivePrograms } from '@/sanity/services/programService';
import { type Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('contactPage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		robots: metadata.robots
	};
}

type ContactPageProps = {
	searchParams: Promise<{ type?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
	const params = await searchParams;
	const pageData = await getContactPageData();
	const programs = await getActivePrograms();

	if (!pageData) {
		throw new Error('Contact page is missing critical content');
	}

	// Validate and get the contact type from URL
	const validTypes: ContactType[] = ['player', 'coach', 'sponsor', 'program', 'general'];
	const initialType: ContactType = validTypes.includes(params.type as ContactType)
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
		<PageContainer heading={pageData.heading} intro={pageData.introduction}>
			<ContactForm
				initialType={initialType}
				programs={programsForForm}
				typeContentMap={typeContentMap}
			/>
		</PageContainer>
	);
}
