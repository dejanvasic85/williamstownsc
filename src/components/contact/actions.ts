'use server';

import { getClientConfig } from '@/lib/config';
import { sendContactFormEmails } from '@/lib/contact/contactEmail';
import { contactFormSchema } from '@/lib/contact/contactFormSchema';
import { getSiteSettings } from '@/lib/content/siteSettings';
import { recaptchaAction } from '@/lib/recaptcha/constants';
import { verifyRecaptchaToken } from '@/lib/recaptcha/verifyToken';
import { headers } from 'next/headers';

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

			const requestHeaders = await headers();
			const userAgent = requestHeaders.get('user-agent') ?? undefined;
			const ipAddress =
				requestHeaders.get('x-forwarded-for')?.split(',')[0] ??
				requestHeaders.get('x-real-ip') ??
				undefined;

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
