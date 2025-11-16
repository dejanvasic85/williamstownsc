'use client';

import { schemaTypes } from '@/sanity/schema/index';
import { structure } from '@/sanity/structure';
import { visionTool } from '@sanity/vision';
import { NextStudio } from 'next-sanity/studio';
import { structureTool } from 'sanity/structure';

export default function StudioPage() {
	return (
		<NextStudio
			config={{
				title: 'Content Studio',
				projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
				dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
				basePath: '/studio',
				plugins: [structureTool({ structure }), visionTool()],
				schema: {
					types: schemaTypes
				}
			}}
		/>
	);
}
