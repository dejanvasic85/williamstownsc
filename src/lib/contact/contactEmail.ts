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

	const bodyHtml = `<!DOCTYPE html>
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

	await sendEmail({
		from,
		to: email,
		subject,
		bodyHtml
	});
}

function createTableRow(name: string, value: string | undefined) {
	return value
		? `<tr><td style="padding: 8px 0; font-weight: bold;">${name}:</td><td style="padding: 8px 0;">${value}</td></tr>`
		: '';
}

async function sendNotificationEmail(data: ContactFormData, recipientEmail: string, from: string) {
	const subject = `New ${typeLabels[data.contactType]} - ${data.name}`;

	let additionalDetailsHtml = '';

	if (data.contactType === 'player') {
		additionalDetailsHtml = `
				${createTableRow('Age Group', data.ageGroup)}
				${createTableRow('Experience', data.experience)}
				${createTableRow('Position', data.position)}`;
	} else if (data.contactType === 'coach') {
		additionalDetailsHtml = `
				${createTableRow('Qualifications', data.qualifications)}
				${createTableRow('Experience', data.experience)}
				${createTableRow('Age Groups of Interest', data.ageGroupsInterest)}`;
	} else if (data.contactType === 'sponsor') {
		additionalDetailsHtml = `
				${createTableRow('Organization', data.organization)}
				${createTableRow('Sponsorship Tier', data.sponsorshipTier)}`;
	} else if (data.contactType === 'program') {
		additionalDetailsHtml = createTableRow('Program', data.programId);
	} else if (data.contactType === 'general') {
		additionalDetailsHtml = createTableRow('Subject', data.subject);
	}

	const bodyHtml = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
	<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
		<div style="background-color: white; padding: 20px; border-radius: 8px;">
			<h2 style="color: #2563eb; margin-top: 0;">New ${typeLabels[data.contactType]}</h2>
			<table style="width: 100%; border-collapse: collapse;">
				${createTableRow('Name', data.name)}
				<tr>
					<td style="padding: 8px 0; font-weight: bold;">Email:</td>
					<td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
				</tr>
				${createTableRow('Phone', data.phone || 'Not provided')}
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
		bodyHtml
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
