import { ReactNode } from 'react';
import { Footer } from './Footer';

type PageContainerProps = {
	children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
	return (
		<div className="bg-base-200 min-h-screen py-6 pb-36 lg:py-12 lg:pt-(--navbar-total-height-desktop) lg:pb-12">
			<div className="container mx-auto px-4">{children}</div>
			<Footer />
		</div>
	);
}
