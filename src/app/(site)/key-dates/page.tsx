import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { KeyDateItem, getKeyDatesPageData } from '@/lib/content';
import { getEditablePageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getEditablePageMetadata('keyDatesPage');
}

function formatDate(dateString: string): { day: string; month: string; year: string } {
	const date = new Date(dateString);
	return {
		day: date.toLocaleDateString('en-AU', { day: 'numeric' }),
		month: date.toLocaleDateString('en-AU', { month: 'short' }),
		year: date.toLocaleDateString('en-AU', { year: 'numeric' })
	};
}

function KeyDateCard({ item }: { item: KeyDateItem }) {
	const { day, month, year } = formatDate(item.date);

	return (
		<div className="bg-base-100 flex gap-6 rounded-xl p-6 shadow-md">
			<div className="bg-secondary/10 flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg">
				<span className="text-secondary text-2xl font-bold">{day}</span>
				<span className="text-secondary text-sm font-medium uppercase">{month}</span>
			</div>
			<div className="flex flex-col justify-center">
				<h3 className="text-lg font-semibold">{item.title}</h3>
				{item.description && (
					<p className="text-base-content/70 mt-1 text-sm">{item.description}</p>
				)}
				<p className="text-base-content/50 mt-1 text-xs">{year}</p>
			</div>
		</div>
	);
}

export default async function KeyDatesPage() {
	const pageData = await getKeyDatesPageData();

	return (
		<PageContainer
			heading={pageData?.heading || 'Key Dates 2026'}
			featuredImage={pageData?.featuredImage}
			intro={pageData?.introduction}
			layout="article"
		>
			{pageData?.body && pageData.body.length > 0 && <PortableTextContent blocks={pageData.body} />}

			{pageData?.keyDates && pageData.keyDates.length > 0 && (
				<div className="mt-10">
					<div className="grid gap-4">
						{pageData.keyDates.map((item, index) => (
							<KeyDateCard key={index} item={item} />
						))}
					</div>
				</div>
			)}

			{(!pageData?.keyDates || pageData.keyDates.length === 0) && (
				<div className="bg-base-100 mt-10 rounded-xl p-12 text-center">
					<Calendar className="text-base-content/30 mx-auto h-16 w-16" />
					<p className="text-base-content/70 mt-4 text-lg">
						Key dates for the upcoming season will be announced soon.
					</p>
				</div>
			)}
		</PageContainer>
	);
}
