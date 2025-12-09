'use server';

import { sendContactFormEmails } from '@/lib/contact/contactEmail';
import { contactFormSchema } from '@/lib/contact/contactFormSchema';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

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
		// Extract form data
		const rawData = {
			contactType: formData.get('contactType'),
			name: formData.get('name'),
			email: formData.get('email'),
			phone: formData.get('phone') || undefined,
			message: formData.get('message'),
			// Player fields
			ageGroup: formData.get('ageGroup') || undefined,
			experience: formData.get('experience') || undefined,
			position: formData.get('position') || undefined,
			// Coach fields
			qualifications: formData.get('qualifications') || undefined,
			ageGroupsInterest: formData.get('ageGroupsInterest') || undefined,
			// Sponsor fields
			organization: formData.get('organization') || undefined,
			sponsorshipTier: formData.get('sponsorshipTier') || undefined,
			// Program fields
			programId: formData.get('programId') || undefined,
			// General fields
			subject: formData.get('subject') || undefined
		};

		// Validate the form data
		const validationResult = contactFormSchema.safeParse(rawData);

		if (!validationResult.success) {
			return {
				success: false,
				message: 'Please check your form and try again.',
				error: validationResult.error.issues.map((i) => i.message).join(', ')
			};
		}

		const data = validationResult.data;

		// Fetch email configuration from Sanity
		const query = groq`*[_type == "siteSettings"][0]{
			contactEmails
		}`;

		const settings = await client.fetch(query);

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
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
