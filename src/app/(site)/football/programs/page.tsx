import type { Metadata } from 'next';
import type { PortableTextBlock } from '@portabletext/types';
import { PageContainer } from '@/components/layout';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { getActivePrograms } from '@/sanity/services/programService';

export const metadata: Metadata = {
	title: 'Football Programs | Williamstown SC',
	description:
		'Explore our football programs for all ages. Join Williamstown Soccer Club and develop your skills with our experienced coaches.',
	keywords: 'football programs, soccer training, youth football, Williamstown SC'
};

const gradients = ['purple', 'blue', 'green', 'orange', 'red', 'teal'];

export default async function FootballProgramsPage() {
	const programs = await getActivePrograms();

	if (!programs || programs.length === 0) {
		return (
			<PageContainer heading="Football Programs">
				<p className="text-center text-lg">No programs available at this time. Check back soon!</p>
			</PageContainer>
		);
	}

	return (
		<PageContainer heading="Football Programs">
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{programs.map((program, index) => (
					<ProgramCard
						key={program._id}
						name={program.name || ''}
						startDate={program.startDate || ''}
						endDate={program.endDate || ''}
						minAge={program.minAge || 0}
						maxAge={program.maxAge || 0}
						description={(program.description as PortableTextBlock[]) || []}
						imageUrl={program.imageUrl}
						gradient={gradients[index % gradients.length]}
					/>
				))}
			</div>
		</PageContainer>
	);
}
