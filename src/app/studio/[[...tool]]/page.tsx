'use client';

import { visionTool } from '@sanity/vision';
import { NextStudio } from 'next-sanity/studio';
import { structureTool } from 'sanity/structure';
import { getClientConfig } from '@/lib/config';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { csvExportPlugin } from '@/sanity/plugins/csvExport';
import { schemaTypes } from '@/sanity/schema/index';
import { structure } from '@/sanity/structure';

export default function StudioPage() {
	const { sanityProjectId, sanityDataset } = getClientConfig();

	return (
		<QueryProvider>
			<NextStudio
				config={{
					title: 'Content Studio',
					projectId: sanityProjectId,
					dataset: sanityDataset,
					basePath: '/studio',
					plugins: [structureTool({ structure }), visionTool(), csvExportPlugin()],
					schema: {
						types: schemaTypes
					}
				}}
			/>
		</QueryProvider>
	);
}
