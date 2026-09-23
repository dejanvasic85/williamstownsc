import { type SanityImageSource, createImageUrlBuilder } from '@sanity/image-url';
import type { Tenant } from '@/tenants/schema/tenantSchema';

/** The public part of a club's Sanity project, enough to build image URLs. */
export type SanityImageProject = Tenant['sanity'];

const imageUrlBuilderByProjectValue = new Map<string, ReturnType<typeof createImageUrlBuilder>>();

/**
 * Build a Sanity image URL for a club's project. The project and dataset come from the caller,
 * never a module-level default, so one club's images never point at another club's project.
 */
export function urlFor(sanity: SanityImageProject, source: SanityImageSource) {
	const key = `${sanity.projectId}/${sanity.dataset}`;
	const cached = imageUrlBuilderByProjectValue.get(key);
	if (cached) {
		return cached.image(source);
	}

	const builder = createImageUrlBuilder(sanity);
	imageUrlBuilderByProjectValue.set(key, builder);
	return builder.image(source);
}
