import type { Metadata } from 'next';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { MapEmbed } from '@/components/ui';
import { getSiteSettings } from '@/lib/content';
import { getPageData, getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('locationsPage');
}

export default async function ClubLocationsPage() {
	const pageData = await getPageData('locationsPage');
	const siteSettings = await getSiteSettings();
	const { locations = [] } = siteSettings;

	if (!pageData || locations.length == 0) {
		throw new Error('Locations page is missing critical content');
	}

	return (
		<PageContainer
			heading={pageData.heading}
			featuredImage={pageData.featuredImage}
			intro={pageData.introduction}
			layout="article"
		>
			{pageData.body && pageData.body.length > 0 && <PortableTextContent blocks={pageData.body} />}
			<div className="grid grid-cols-1 gap-4">
				{locations.map((location, index) => (
					<div className="bg-base-100 col-span-1 rounded-xl p-8" key={index}>
						<h2 className="mb-4 text-2xl font-bold">{location.name}</h2>
						<p className="my-4 text-gray-600">{location.address}</p>
						{location.mapEmbedUrl && (
							<MapEmbed src={location.mapEmbedUrl} title={`Map of ${location.name}`} />
						)}
					</div>
				))}
			</div>
		</PageContainer>
	);
}
