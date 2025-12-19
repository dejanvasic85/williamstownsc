import { z } from 'zod';

const commonFieldsSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
	phone: z.string().max(20, 'Phone must be 20 characters or less').optional(),
	message: z
		.string()
		.min(10, 'Message must be at least 10 characters')
		.max(2000, 'Message must be 2000 characters or less'),
	recaptchaToken: z.string().optional()
});

export const playerFormSchema = commonFieldsSchema.extend({
	contactType: z.literal('player'),
	ageGroup: z.string().optional(),
	experience: z.string().optional(),
	position: z.string().optional()
});

export const coachFormSchema = commonFieldsSchema.extend({
	contactType: z.literal('coach'),
	qualifications: z.string().optional(),
	experience: z.string().optional(),
	ageGroupsInterest: z.string().optional()
});

export const sponsorFormSchema = commonFieldsSchema.extend({
	contactType: z.literal('sponsor'),
	organization: z.string().optional(),
	sponsorshipTier: z.string().optional()
});

export const programFormSchema = commonFieldsSchema.extend({
	contactType: z.literal('program'),
	programId: z.string().optional()
});

export const generalFormSchema = commonFieldsSchema.extend({
	contactType: z.literal('general'),
	subject: z.string().optional()
});

export const contactFormSchema = z.discriminatedUnion('contactType', [
	playerFormSchema,
	coachFormSchema,
	sponsorFormSchema,
	programFormSchema,
	generalFormSchema
]);

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type PlayerFormData = z.infer<typeof playerFormSchema>;
export type CoachFormData = z.infer<typeof coachFormSchema>;
export type SponsorFormData = z.infer<typeof sponsorFormSchema>;
export type ProgramFormData = z.infer<typeof programFormSchema>;
export type GeneralFormData = z.infer<typeof generalFormSchema>;
