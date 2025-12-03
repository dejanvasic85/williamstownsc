import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getAboutPageData, getAboutPageMetadata } from '@/lib/content/aboutPage';
import { type Metadata } from 'next';
import Image from 'next/image';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getAboutPageMetadata();

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		robots: metadata.robots
	};
}

export default async function ClubAboutPage() {
	const pageData = await getAboutPageData();

	if (!pageData) {
		return (
			<PageContainer>
				<h1 className="border-secondary mb-8 border-b-4 pb-4 text-2xl font-bold lg:text-3xl">
					About Our Club
				</h1>
				<p>Content coming soon.</p>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			{/* Page Heading */}
			<h1 className="border-secondary mb-8 border-b-4 pb-4 text-2xl font-bold lg:text-3xl">
				{pageData.heading}
			</h1>

			{/* Featured Image */}
			{pageData.featuredImage && (
				<div className="mb-8">
					<Image
						src={pageData.featuredImage.url}
						alt={pageData.featuredImage.alt || pageData.heading}
						width={1200}
						height={600}
						className="h-auto w-full rounded-lg"
						priority
					/>
				</div>
			)}

			{/* Introduction */}
			{pageData.introduction && pageData.introduction.length > 0 && (
				<div className="text-base-content/80 mb-6 text-lg">
					<PortableTextContent blocks={pageData.introduction} />
				</div>
			)}

			{/* Main Body Content */}
			{pageData.body && pageData.body.length > 0 && <PortableTextContent blocks={pageData.body} />}
		</PageContainer>
	);
}
