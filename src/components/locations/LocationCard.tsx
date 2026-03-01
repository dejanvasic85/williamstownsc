import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { MapEmbed } from '@/components/ui';
import { buildDirectionsUrl, facilityTypeLabel, formatAddress } from '@/lib/address';
import type { SiteSettings } from '@/sanity/sanity.types';

type Location = NonNullable<SiteSettings['locations']>[number];

type LocationCardProps = {
	location: Location;
};

export function LocationCard({ location }: LocationCardProps) {
	const badge = facilityTypeLabel(location.facilityType);
	const address = formatAddress(location);
	const directionsUrl = buildDirectionsUrl(location);

	return (
		<article className="card bg-surface shadow-lg">
			{location.mapEmbedUrl && (
				<figure>
					<MapEmbed
						src={location.mapEmbedUrl}
						title={`Map of ${location.name}`}
						aspectRatio="4/3"
					/>
				</figure>
			)}

			<div className="card-body p-6">
				{badge && <div className="badge badge-secondary text-sm font-semibold">{badge}</div>}

				<h2 className="card-title text-2xl font-bold">{location.name}</h2>

				<div className="text-base-content/70 flex items-start gap-2">
					<MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
					<address className="not-italic">{address}</address>
				</div>

				<div className="card-actions mt-4 flex flex-wrap gap-3">
					<a
						href={directionsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-primary"
						aria-label={`Get directions to ${location.name}`}
					>
						<Navigation className="h-4 w-4" aria-hidden="true" />
						Get Directions
					</a>
					{location.mapLink && (
						<a
							href={location.mapLink}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-outline"
							aria-label={`Open ${location.name} in Google Maps`}
						>
							<ExternalLink className="h-4 w-4" aria-hidden="true" />
							Open in Maps
						</a>
					)}
				</div>
			</div>
		</article>
	);
}
