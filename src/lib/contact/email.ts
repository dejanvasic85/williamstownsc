import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { getAwsConfig, isLocal } from '@/lib/config';

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
	bodyHtml: string;
	subject: string;
	cc?: string;
	bcc?: string;
}

function htmlToPlainText(html: string): string {
	return html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>/gi, '\n\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#39;/g, "'")
		.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
		.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
		.trim();
}

export async function sendEmail(email: Email) {
	const plainTextBody = htmlToPlainText(email.bodyHtml);

	if (isLocal()) {
		console.log('IsLocal is true, not sending emails');
		console.log('to', email.to);
		console.log('body', plainTextBody);
		return;
	}

	const sesClient = getSESClient();

	await sesClient.send(
		new SendEmailCommand({
			Destination: {
				ToAddresses: [email.to],
				CcAddresses: email.cc
					? email.cc
							.split(',')
							.map((addr) => addr.trim())
							.filter((addr) => addr)
					: undefined,
				BccAddresses: email.bcc
					? email.bcc
							.split(',')
							.map((addr) => addr.trim())
							.filter((addr) => addr)
					: undefined
			},
			Message: {
				Body: {
					Text: {
						Data: plainTextBody
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
