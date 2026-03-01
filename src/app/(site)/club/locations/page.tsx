import type { Metadata } from 'next';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { LocationCard } from '@/components/locations';
import { getSiteSettings } from '@/lib/content';
import { getEditablePageMetadata, getPageData } from '@/lib/content/page';
import { generateLocationsSchema } from '@/lib/structuredData';

export async function generateMetadata(): Promise<Metadata> {
	return getEditablePageMetadata('locationsPage');
}

export default async function ClubLocationsPage() {
	const pageData = await getPageData('locationsPage');
	const siteSettings = await getSiteSettings();
	const locations = siteSettings.locations ?? [];

	if (!pageData || locations.length === 0) {
		throw new Error('Locations page is missing critical content');
	}

	const locationsSchema = generateLocationsSchema(locations);

	return (
		<>
			{locationsSchema.map((schema, index) => (
				<script
					key={index}
					id={`location-schema-${index}`}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			))}
			<PageContainer
				heading={pageData.heading}
				featuredImage={pageData.featuredImage}
				intro={pageData.introduction}
				layout="article"
			>
				{pageData.body && pageData.body.length > 0 && (
					<PortableTextContent blocks={pageData.body} />
				)}
				<div className="grid grid-cols-1 gap-6">
					{locations.map((location) => (
						<LocationCard key={location._key} location={location} />
					))}
				</div>
			</PageContainer>
		</>
	);
}
