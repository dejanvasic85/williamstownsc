import { Navbar } from '@/components/layout';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<main>{children}</main>
		</>
	);
}
