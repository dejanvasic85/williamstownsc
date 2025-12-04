import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { getPageData, getPageMetadata } from '@/lib/content/page';
import { type Metadata } from 'next';
import Image from 'next/image';

export async function generateMetadata(): Promise<Metadata> {
	const metadata = await getPageMetadata('aboutPage');

	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: metadata.openGraph,
		robots: metadata.robots
	};
}

export default async function ClubAboutPage() {
	const pageData = await getPageData('aboutPage');

	if (!pageData) {
		throw new Error('About page is missing critical content');
	}

	return (
		<PageContainer heading={pageData.heading}>
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
