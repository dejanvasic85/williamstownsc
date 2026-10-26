import Link from 'next/link';
import { Mail } from 'lucide-react';
import { routes } from '@/lib/routes';

export function ContactSection() {
	return (
		<div className="bg-primary/10 border-primary/30 dark:bg-surface dark:border-primary flex h-full flex-col gap-4 border p-6 md:rounded-2xl md:p-8">
			<div className="bg-primary/15 w-fit rounded-full p-3">
				<Mail className="text-primary h-8 w-8" aria-hidden="true" />
			</div>
			<h2 className="text-2xl font-bold md:text-3xl">Get in Touch</h2>
			<p className="text-base-content/70 text-base md:text-lg">
				Have a question about the club? Send us a message and we will get back to you.
			</p>
			<Link href={routes.contact()} className="btn btn-primary btn-lg mt-auto">
				Contact Us
			</Link>
		</div>
	);
}
