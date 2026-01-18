'use server';

import { headers } from 'next/headers';
import { getClientConfig } from '@/lib/config';
import { sendContactFormEmails } from '@/lib/contact/contactEmail';
import { contactFormSchema } from '@/lib/contact/contactFormSchema';
import { getSiteSettings } from '@/lib/content/siteSettings';
import { recaptchaAction } from '@/lib/recaptcha/constants';
import { verifyRecaptchaToken } from '@/lib/recaptcha/verifyToken';
import { writeClient } from '@/sanity/lib/writeClient';

export type FormState = {
	success: boolean;
	message: string;
	error?: string;
};

export async function submitContactForm(
	_prevState: FormState | null,
	formData: FormData
): Promise<FormState> {
	try {
		// Convert FormData to object and let Zod handle parsing
		const rawData = Object.fromEntries(formData);
		const validationResult = contactFormSchema.safeParse(rawData);

		if (!validationResult.success) {
			return {
				success: false,
				message: 'Please check your form and try again.',
				error: validationResult.error.issues.map((i) => i.message).join(', ')
			};
		}

		const data = validationResult.data;

		// Get request metadata (used for both reCAPTCHA and Sanity)
		const requestHeaders = await headers();
		const userAgent = requestHeaders.get('user-agent') ?? undefined;
		const ipAddress =
			requestHeaders.get('x-forwarded-for')?.split(',')[0] ??
			requestHeaders.get('x-real-ip') ??
			undefined;

		// Verify reCAPTCHA token - required when reCAPTCHA is configured
		const clientConfig = getClientConfig();
		const recaptchaEnabled = !!clientConfig.recaptchaSiteKey;

		if (recaptchaEnabled) {
			if (!data.recaptchaToken) {
				return {
					success: false,
					message: 'Security verification failed. Please try again.',
					error: 'Missing reCAPTCHA token'
				};
			}

			const recaptchaResult = await verifyRecaptchaToken(
				data.recaptchaToken,
				recaptchaAction,
				userAgent,
				ipAddress
			);

			if (!recaptchaResult.success) {
				return {
					success: false,
					message: 'Security verification failed. Please try again.',
					error: recaptchaResult.error
				};
			}
		}

		const settings = await getSiteSettings();

		if (!settings?.contactEmails) {
			return {
				success: false,
				message: 'Email configuration not found. Please contact the administrator.',
				error: 'Missing contactEmails in site settings'
			};
		}

		const { contactEmails } = settings;

		// Get the appropriate recipient email based on contact type
		const recipientEmail = contactEmails[data.contactType] || contactEmails.general;

		if (!recipientEmail) {
			return {
				success: false,
				message: 'Recipient email not configured. Please contact the administrator.',
				error: `No email configured for ${data.contactType} enquiries`
			};
		}

		// Get the from email address
		const emailFrom = contactEmails.from;

		if (!emailFrom) {
			return {
				success: false,
				message: 'Sender email not configured. Please contact the administrator.',
				error: 'Missing from email address in site settings'
			};
		}

		// Save submission to Sanity
		try {
			const submissionData = {
				_type: 'formSubmission',
				contactType: data.contactType,
				submittedAt: new Date().toISOString(),
				status: 'new',
				name: data.name,
				email: data.email,
				phone: data.phone || undefined,
				message: data.message,
				metadata: {
					userAgent,
					ipAddress
				}
			};

			// Add type-specific fields based on contact type
			const typeSpecificFields: Record<string, unknown> = {};

			switch (data.contactType) {
				case 'player':
					if (data.ageGroup) typeSpecificFields.ageGroup = data.ageGroup;
					if (data.experience) typeSpecificFields.experience = data.experience;
					if (data.position) typeSpecificFields.position = data.position;
					break;
				case 'coach':
					if (data.qualifications) typeSpecificFields.qualifications = data.qualifications;
					if (data.experience) typeSpecificFields.coachExperience = data.experience;
					if (data.ageGroupsInterest) typeSpecificFields.ageGroupsInterest = data.ageGroupsInterest;
					break;
				case 'sponsor':
					if (data.organization) typeSpecificFields.organization = data.organization;
					if (data.sponsorshipTier) typeSpecificFields.sponsorshipTier = data.sponsorshipTier;
					break;
				case 'program':
					if (data.programId) typeSpecificFields.programId = data.programId;
					break;
				case 'general':
					if (data.subject) typeSpecificFields.subject = data.subject;
					break;
			}

			await writeClient.create({
				...submissionData,
				...typeSpecificFields
			});
		} catch (error) {
			// Log the error but don't fail the submission
			// Email notification is still the primary delivery method
			console.error('Failed to save submission to Sanity:', error);
		}

		// Send emails
		await sendContactFormEmails(data, emailFrom, recipientEmail);

		return {
			success: true,
			message:
				'Thank you for your message! We have received your enquiry and will get back to you soon.'
		};
	} catch (error) {
		console.error('Contact form submission error:', error);

		return {
			success: false,
			message: 'Something went wrong. Please try again later.',
			error: 'Internal server error'
		};
	}
}
