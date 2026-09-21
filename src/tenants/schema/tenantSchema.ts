import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Where a secret value comes from. Starts with 'env' and leaves room for other stores, such as 'ssm'.
const secretSourceSchema = z.discriminatedUnion('from', [
	z.object({
		from: z.literal('env'),
		key: z.string().min(1, 'Secret key is required')
	})
]);

const themeColoursSchema = z.object({
	primary: z.string().min(1, 'Primary colour is required'),
	secondary: z.string().min(1, 'Secondary colour is required'),
	brand: z.string().min(1, 'Brand colour is required')
});

const themeSchema = z.object({
	light: themeColoursSchema,
	dark: themeColoursSchema
});

const sanityConfigSchema = z.object({
	projectId: z.string().min(1, 'Sanity project id is required'),
	dataset: z.string().min(1, 'Sanity dataset is required')
});

const secretsSchema = z.object({
	sanityWriteToken: secretSourceSchema,
	revalidateSecret: secretSourceSchema,
	// Full stadly intake URL, token included. Unset means the club sends no enquiries there.
	enquiryIntakeUrl: secretSourceSchema.optional()
});

// Optional group so a club without a Facebook page omits the whole block, never half of it.
const socialPublishingSchema = z.object({
	metaPageAccessToken: secretSourceSchema,
	metaFacebookPageId: secretSourceSchema,
	metaInstagramAccountId: secretSourceSchema
});

export const tenantSchema = z.object({
	slug: z.string().regex(slugPattern, 'Tenant slug must be lowercase words joined by hyphens'),
	domains: z
		.array(z.string().min(1, 'Domain is required'))
		.min(1, 'At least one domain is required'),
	sanity: sanityConfigSchema,
	secrets: secretsSchema,
	socialPublishing: socialPublishingSchema.optional(),
	theme: themeSchema
});

export type Tenant = z.infer<typeof tenantSchema>;

export function defineTenant(config: Tenant): Tenant {
	return tenantSchema.parse(config);
}
