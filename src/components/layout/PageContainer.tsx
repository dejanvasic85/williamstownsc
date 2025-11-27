import clsx from 'clsx';
import { ReactNode } from 'react';

type PageContainerProps = {
	children: ReactNode;
	heading?: string;
	intro?: string;
};

export function PageContainer({ children, heading, intro }: PageContainerProps) {
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
					<h1 className="border-secondary mb-6 border-b-4 pb-4 text-4xl font-bold">{heading}</h1>
				)}
				{intro && <p className="mb-6 text-lg">{intro}</p>}
				<main className="py-3">{children}</main>
			</div>
		</div>
	);
}
