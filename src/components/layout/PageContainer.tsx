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
					<div className="mb-6">
						<div className="border-secondary mb-4 flex items-center gap-3 border-b-4 pb-4">
							<h1 className="text-3xl font-bold">{heading}</h1>
						</div>
						{intro && <p className="text-lg">{intro}</p>}
					</div>
				)}
				<main className="py-3">{children}</main>
			</div>
		</div>
	);
}
