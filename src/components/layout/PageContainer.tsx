import { PortableTextContent } from '@/components/content/PortableTextContent';
import { type PortableTextBlock } from '@portabletext/types';
import clsx from 'clsx';
import Image from 'next/image';
import { ReactNode } from 'react';

type PageContainerProps = {
	children?: ReactNode;
	heading?: string;
	intro?: string | PortableTextBlock[];
	featuredImage?: {
		url: string;
		alt?: string;
	};
};

export function PageContainer({ children, heading, intro, featuredImage }: PageContainerProps) {
	return (
		<div
			className={clsx(
				'bg-base-200 min-h-screen',
				'py-6 pb-36',
				'lg:py-12 lg:pt-(--navbar-total-height-desktop) lg:pb-12'
			)}
		>
			<div className="container mx-auto px-4">
				{heading && (
					<div className="mb-6">
						<div className="border-secondary mb-4 flex items-center gap-3 border-b-4 pb-4">
							<h1 className="text-3xl font-bold">{heading}</h1>
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
