import { getSiteSettings } from '@/lib/content';
import type { ContactFormData } from './contactFormSchema';
import { sendEmail } from './email';

export type ContactType = 'player' | 'coach' | 'sponsor' | 'program' | 'general';

const typeLabels: Record<ContactType, string> = {
	player: 'Player Registration',
	coach: 'Coaching Enquiry',
	sponsor: 'Sponsorship Enquiry',
	program: 'Program Registration',
	general: 'General Enquiry'
};

async function sendConfirmationEmail(name: string, email: string, from: string) {
	const siteSettings = await getSiteSettings();
	const subject = `Thank you for contacting ${siteSettings.clubName}`;

	const htmlBody = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
	<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
		<h2 style="color: #2563eb;">Thank you for contacting Williamstown SC</h2>
		<p>Dear ${name},</p>
		<p>Thank you for contacting ${siteSettings.clubName}!</p>
		<p>We have received your enquiry and someone from our team will get back to you as soon as possible.</p>
		<p>For urgent matters, you can also contact us directly via the contact details on our website.</p>
		<p>Best regards,<br>
		<strong>${siteSettings.clubName} Team</strong></p>
	</div>
</body>
</html>`;

	const textBody = `Dear ${name},

Thank you for contacting ${siteSettings.clubName}!

We have received your enquiry and someone from our team will get back to you as soon as possible.

For urgent matters, you can also contact us directly via the contact details on our website.

Best regards,
${siteSettings.clubName} Team`;

	await sendEmail({
		from,
		to: email,
		subject,
		body: textBody,
		bodyHtml: htmlBody
	});
}

async function sendNotificationEmail(data: ContactFormData, recipientEmail: string, from: string) {
	const siteSettings = await getSiteSettings();
	const subject = `New ${typeLabels[data.contactType]} - ${data.name}`;

	let additionalDetails = '';
	let additionalDetailsHtml = '';

	if (data.contactType === 'player') {
		additionalDetails = `
Age Group: ${data.ageGroup || 'Not provided'}
Experience: ${data.experience || 'Not provided'}
Position: ${data.position || 'Not provided'}`;

		additionalDetailsHtml = `
				${data.ageGroup ? `<tr><td style="padding: 8px 0; font-weight: bold;">Age Group:</td><td style="padding: 8px 0;">${data.ageGroup}</td></tr>` : ''}
				${data.experience ? `<tr><td style="padding: 8px 0; font-weight: bold;">Experience:</td><td style="padding: 8px 0;">${data.experience}</td></tr>` : ''}
				${data.position ? `<tr><td style="padding: 8px 0; font-weight: bold;">Position:</td><td style="padding: 8px 0;">${data.position}</td></tr>` : ''}`;
	} else if (data.contactType === 'coach') {
		additionalDetails = `
Qualifications: ${data.qualifications || 'Not provided'}
Experience: ${data.experience || 'Not provided'}
Age Groups of Interest: ${data.ageGroupsInterest || 'Not provided'}`;

		additionalDetailsHtml = `
				${data.qualifications ? `<tr><td style="padding: 8px 0; font-weight: bold;">Qualifications:</td><td style="padding: 8px 0;">${data.qualifications}</td></tr>` : ''}
				${data.experience ? `<tr><td style="padding: 8px 0; font-weight: bold;">Experience:</td><td style="padding: 8px 0;">${data.experience}</td></tr>` : ''}
				${data.ageGroupsInterest ? `<tr><td style="padding: 8px 0; font-weight: bold;">Age Groups of Interest:</td><td style="padding: 8px 0;">${data.ageGroupsInterest}</td></tr>` : ''}`;
	} else if (data.contactType === 'sponsor') {
		additionalDetails = `
Organization: ${data.organization || 'Not provided'}
Sponsorship Tier: ${data.sponsorshipTier || 'Not provided'}`;

		additionalDetailsHtml = `
				${data.organization ? `<tr><td style="padding: 8px 0; font-weight: bold;">Organization:</td><td style="padding: 8px 0;">${data.organization}</td></tr>` : ''}
				${data.sponsorshipTier ? `<tr><td style="padding: 8px 0; font-weight: bold;">Sponsorship Tier:</td><td style="padding: 8px 0;">${data.sponsorshipTier}</td></tr>` : ''}`;
	} else if (data.contactType === 'program') {
		additionalDetails = `
Program: ${data.programId || 'Not provided'}`;

		additionalDetailsHtml = `
				${data.programId ? `<tr><td style="padding: 8px 0; font-weight: bold;">Program:</td><td style="padding: 8px 0;">${data.programId}</td></tr>` : ''}`;
	} else if (data.contactType === 'general') {
		additionalDetails = `
Subject: ${data.subject || 'Not provided'}`;

		additionalDetailsHtml = `
				${data.subject ? `<tr><td style="padding: 8px 0; font-weight: bold;">Subject:</td><td style="padding: 8px 0;">${data.subject}</td></tr>` : ''}`;
	}

	const textBody = `New contact form submission received:

Type: ${typeLabels[data.contactType]}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
${additionalDetails}

Message:
${data.message}`;

	const htmlBody = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
	<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
		<div style="background-color: white; padding: 20px; border-radius: 8px;">
			<h2 style="color: #2563eb; margin-top: 0;">New ${typeLabels[data.contactType]}</h2>
			<table style="width: 100%; border-collapse: collapse;">
				<tr>
					<td style="padding: 8px 0; font-weight: bold;">Name:</td>
					<td style="padding: 8px 0;">${data.name}</td>
				</tr>
				<tr>
					<td style="padding: 8px 0; font-weight: bold;">Email:</td>
					<td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
				</tr>
				<tr>
					<td style="padding: 8px 0; font-weight: bold;">Phone:</td>
					<td style="padding: 8px 0;">${data.phone || 'Not provided'}</td>
				</tr>
				${additionalDetailsHtml}
			</table>
			<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
				<p style="font-weight: bold; margin-bottom: 8px;">Message:</p>
				<p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
			</div>
		</div>
	</div>
</body>
</html>`;

	await sendEmail({
		from,
		to: recipientEmail,
		subject,
		body: textBody,
		bodyHtml: htmlBody
	});
}

export async function sendContactFormEmails(
	data: ContactFormData,
	emailFrom: string,
	recipientEmail: string
) {
	await Promise.all([
		sendConfirmationEmail(data.name, data.email, emailFrom),
		sendNotificationEmail(data, recipientEmail, emailFrom)
	]);
}
