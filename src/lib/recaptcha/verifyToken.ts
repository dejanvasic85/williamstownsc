import { getRecaptchaConfig } from '@/lib/config';

type RecaptchaAssessmentResponse = {
	tokenProperties?: {
		valid: boolean;
		action: string;
	};
	riskAnalysis?: {
		score: number;
	};
	error?: {
		code: number;
		message: string;
	};
};

type VerificationResult = {
	success: boolean;
	score?: number;
	error?: string;
};

const riskScoreThreshold = 0.5;

export async function verifyRecaptchaToken(
	token: string,
	expectedAction: string,
	userAgent?: string,
	ipAddress?: string
): Promise<VerificationResult> {
	try {
		const { recaptchaSecretKey, googleCloudProjectId } = getRecaptchaConfig();

		const assessmentUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${googleCloudProjectId}/assessments?key=${recaptchaSecretKey}`;

		const response = await fetch(assessmentUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				event: {
					token,
					siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
					expectedAction,
					userAgent,
					userIpAddress: ipAddress
				}
			})
		});

		if (!response.ok) {
			console.error('reCAPTCHA API error:', response.status, response.statusText);
			return {
				success: false,
				error: 'Failed to verify reCAPTCHA token'
			};
		}

		const data: RecaptchaAssessmentResponse = await response.json();

		if (data.error) {
			console.error('reCAPTCHA assessment error:', data.error);
			return {
				success: false,
				error: data.error.message
			};
		}

		if (!data.tokenProperties?.valid) {
			console.warn('Invalid reCAPTCHA token');
			return {
				success: false,
				error: 'Invalid reCAPTCHA token'
			};
		}

		if (data.tokenProperties.action !== expectedAction) {
			console.warn(
				`reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.tokenProperties.action}`
			);
			return {
				success: false,
				error: 'reCAPTCHA action mismatch'
			};
		}

		const score = data.riskAnalysis?.score ?? 0;

		if (score < riskScoreThreshold) {
			console.warn(`reCAPTCHA score too low: ${score}`);
			return {
				success: false,
				score,
				error: 'reCAPTCHA verification failed'
			};
		}

		return {
			success: true,
			score
		};
	} catch (error) {
		console.error('reCAPTCHA verification error:', error);
		return {
			success: false,
			error: 'reCAPTCHA verification failed'
		};
	}
}
