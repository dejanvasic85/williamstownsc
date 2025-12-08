import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { getAwsConfig, isLocal } from '../config';

function getSESClient() {
	const config = getAwsConfig();

	return new SESClient({
		region: config.awsRegion,
		credentials: {
			accessKeyId: config.awsAccessKeyId,
			secretAccessKey: config.awsSecretAccessKey
		}
	});
}

export interface Email {
	to: string;
	from: string;
	body: string;
	bodyHtml: string;
	subject: string;
	cc?: string;
	bcc?: string;
}

export async function sendEmail(email: Email) {
	if (isLocal()) {
		console.log('IsLocal is true, not sending emails');
		console.log('to', email.to);
		console.log('body', email.body);
		return;
	}

	const sesClient = getSESClient();

	await sesClient.send(
		new SendEmailCommand({
			Destination: {
				ToAddresses: [email.to],
				CcAddresses: email.cc ? [email.cc] : [],
				BccAddresses: email.bcc ? [email.bcc] : []
			},
			Message: {
				Body: {
					Text: {
						Data: email.body
					},
					Html: {
						Data: email.bodyHtml
					}
				},
				Subject: {
					Data: email.subject
				}
			},
			Source: email.from
		})
	);
}

// Re-export from contactEmail for convenience
export { sendContactFormEmails } from './contactEmail';
export type { ContactType } from './contactEmail';
export type { ContactFormData } from './contactFormSchema';
