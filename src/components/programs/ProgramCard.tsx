import Image from 'next/image';
import Link from 'next/link';
import type { PortableTextBlock } from '@portabletext/types';
import { PortableTextContent } from '../content/PortableTextContent';

interface ProgramCardProps {
	name: string;
	startDate: string;
	endDate: string;
	minAge: number;
	maxAge: number;
	description: PortableTextBlock[];
	imageUrl?: string;
	gradient: string;
}

const gradientClasses = {
	purple: 'from-purple-600 to-purple-900',
	blue: 'from-blue-600 to-blue-900',
	green: 'from-green-600 to-green-900',
	orange: 'from-orange-600 to-orange-900',
	red: 'from-red-600 to-red-900',
	teal: 'from-teal-600 to-teal-900'
};

export function ProgramCard({
	name,
	startDate,
	endDate,
	minAge,
	maxAge,
	description,
	imageUrl,
	gradient
}: ProgramCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-AU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};

	const gradientClass =
		gradientClasses[gradient as keyof typeof gradientClasses] || gradientClasses.blue;
	const encodedProgramName = encodeURIComponent(name);

	return (
		<div
			className={`overflow-hidden rounded-3xl bg-linear-to-br ${gradientClass} text-white shadow-lg`}
		>
			{imageUrl && (
				<div className="relative h-48 w-full">
					<Image
						src={imageUrl}
						alt={name}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</div>
			)}

			<div className="p-6">
				<h3 className="mb-2 text-2xl font-bold">{name}</h3>

				<div className="mb-4 flex flex-wrap gap-4 text-sm">
					<div>
						<span className="font-semibold">Ages:</span> {minAge}-{maxAge}
					</div>
					<div>
						<span className="font-semibold">Duration:</span> {formatDate(startDate)} -{' '}
						{formatDate(endDate)}
					</div>
				</div>

				{description && description.length > 0 && (
					<div className="mb-6">
						<PortableTextContent
							blocks={description}
							className="text-white/90"
							headingLevel="section"
						/>
					</div>
				)}

				<Link
					href={`/contact?type=program&name=${encodedProgramName}`}
					className="btn btn-outline border-white text-white hover:bg-white hover:text-blue-900"
				>
					Enquire Now
				</Link>
			</div>
		</div>
	);
}
