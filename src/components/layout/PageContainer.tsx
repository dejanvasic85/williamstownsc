import Image from 'next/image';
import { ReactNode } from 'react';
import clsx from 'clsx';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { getActiveAnnouncements } from '@/lib/announcements';

type PageContainerProps = {
	children?: ReactNode;
	heading?: string;
	intro?: string | unknown[];
	featuredImage?: {
		url: string;
		alt?: string;
	};
	layout?: 'full-width' | 'article';
};

export async function PageContainer({
	children,
	heading,
	intro,
	featuredImage,
	layout = 'full-width'
}: PageContainerProps) {
	const { hasAnnouncements } = await getActiveAnnouncements();

	return (
		<div
			className={clsx(
				'bg-base-100 min-h-screen',
				'py-6 pb-36',
				hasAnnouncements ? 'lg:pt-(--navbar-with-banner-height)' : 'lg:pt-(--navbar-with-offset)'
			)}
		>
			<div className={clsx('mx-auto px-4', layout === 'article' ? 'max-w-4xl' : 'container')}>
				{heading && (
					<div className="mb-6">
						<div className="border-secondary mb-4 flex items-center gap-3 border-b-4 pb-4">
							<h1 className="text-2xl font-bold lg:text-3xl">{heading}</h1>
						</div>
						{intro && (
							<div className="text-lg">
								{typeof intro === 'string' ? (
									<p>{intro}</p>
								) : (
									<PortableTextContent blocks={intro} />
								)}
							</div>
						)}
					</div>
				)}
				{featuredImage && (
					<div className="mb-8">
						<Image
							src={featuredImage.url}
							alt={featuredImage.alt || heading || ''}
							width={1200}
							height={600}
							className="h-auto w-full rounded-lg"
							priority
						/>
					</div>
				)}
				<main className="py-3">{children}</main>
			</div>
		</div>
	);
}
