import { z } from 'zod';

// External API Response Schema (JSON:API format from Dribl)
const externalAddressSchema = z.object({
	address_line_1: z.string().nullable(),
	address_line_2: z.string().nullable(),
	city: z.string().nullable(),
	state: z.string().nullable(),
	country: z.string().nullable(),
	postcode: z.string().nullable()
});

const externalSocialSchema = z.object({
	name: z.enum(['facebook', 'instagram', 'twitter']),
	value: z.url()
});

const externalClubAttributesSchema = z.object({
	name: z.string(),
	slug: z.string().nullable(),
	image: z.url(),
	alt_image: z.string().nullable(),
	phone: z.string().nullable(),
	email: z.string().nullable(),
	email_address: z.string().nullable(),
	url: z.string().nullable(),
	color: z.string().nullable(),
	accent: z.string().nullable(),
	address: externalAddressSchema.nullable(),
	socials: z.array(externalSocialSchema).nullable(),
	grounds: z.any().nullable()
});

const externalClubSchema = z.object({
	type: z.literal('clubs'),
	id: z.string(),
	attributes: externalClubAttributesSchema,
	links: z.object({
		self: z.object({
			href: z.url()
		})
	})
});

export const externalApiResponseSchema = z.object({
	data: z.array(externalClubSchema)
});

// Our application format
const addressSchema = z.object({
	street: z.string(),
	city: z.string(),
	state: z.string(),
	postcode: z.string()
});

const socialSchema = z.object({
	platform: z.enum(['facebook', 'instagram', 'twitter']),
	url: z.url()
});

export const clubSchema = z.object({
	externalId: z.string(),
	name: z.string(),
	displayName: z.string(),
	logoUrl: z.url(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	website: z.url().optional(),
	address: addressSchema.optional(),
	socials: z.array(socialSchema).optional()
});

export const clubsSchema = z.object({
	clubs: z.array(clubSchema)
});

// Types
export type ExternalApiResponse = z.infer<typeof externalApiResponseSchema>;
export type ExternalClub = z.infer<typeof externalClubSchema>;
export type Club = z.infer<typeof clubSchema>;
export type Clubs = z.infer<typeof clubsSchema>;

// Transformation function
export function transformExternalClub(externalClub: ExternalClub): Club {
	const { id: externalId, attributes } = externalClub;

	// Combine address lines
	const street =
		[attributes.address?.address_line_1, attributes.address?.address_line_2]
			.filter(Boolean)
			.join(' ') || undefined;

	// Build address object if we have the required fields
	const address =
		street && attributes.address?.city && attributes.address?.state && attributes.address?.postcode
			? {
					street,
					city: attributes.address.city,
					state: attributes.address.state,
					postcode: attributes.address.postcode
				}
			: undefined;

	// Transform socials
	const socials = attributes.socials
		?.map((social) => ({
			platform: social.name,
			url: social.value
		}))
		.filter((s) => s.platform && s.url);

	// Build the club object
	const club: Club = {
		externalId,
		name: attributes.name,
		displayName: `${attributes.name} Seniors`,
		logoUrl: attributes.image,
		email: attributes.email || undefined,
		phone: attributes.phone || undefined,
		website: attributes.url || undefined,
		address,
		socials: socials && socials.length > 0 ? socials : undefined
	};

	return clubSchema.parse(club);
}
