import { getClientConfig, getRecaptchaConfig } from '@/lib/config';
import logger from '@/lib/logger';

const log = logger.child({ module: 'recaptcha' });

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

/**
 * Verifies a reCAPTCHA Enterprise token with Google's API.
 *
 * This function validates the token against Google reCAPTCHA Enterprise API and performs
 * risk analysis to detect potential bot traffic. It checks token validity, action matching,
 * and evaluates the risk score against a threshold (0.5 by default).
 *
 * @param {string} token - The reCAPTCHA token to verify (obtained from client-side execution).
 * @param {string} expectedAction - The action name that should match the token's action.
 * This ensures the token was generated for the intended purpose (e.g., 'contact_form').
 * @param {string} [userAgent] - Optional user agent string from the request headers.
 * @param {string} [ipAddress] - Optional IP address of the client making the request.
 * @returns {Promise<VerificationResult>} A promise that resolves to an object containing:
 * - success: boolean indicating if verification passed
 * - score: optional risk analysis score (0.0 = likely bot, 1.0 = likely human)
 * - error: optional error message if verification failed
 *
 * @throws Never throws - all errors are caught and returned in the result object.
 *
 * Risk score threshold: Tokens with a score below 0.5 are considered suspicious and will fail verification.
 */
export async function verifyRecaptchaToken(
	token: string,
	expectedAction: string,
	userAgent?: string,
	ipAddress?: string
): Promise<VerificationResult> {
	try {
		const { recaptchaSecretKey, googleCloudProjectId, riskScoreThreshold } = getRecaptchaConfig();
		const { recaptchaSiteKey } = getClientConfig();

		const assessmentUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${googleCloudProjectId}/assessments?key=${recaptchaSecretKey}`;

		const response = await fetch(assessmentUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				event: {
					token,
					siteKey: recaptchaSiteKey,
					expectedAction,
					userAgent,
					userIpAddress: ipAddress
				}
			})
		});

		if (!response.ok) {
			log.error(
				{ status: response.status, statusText: response.statusText },
				'reCAPTCHA API error'
			);
			return {
				success: false,
				error: 'reCAPTCHA service unavailable'
			};
		}

		const data: RecaptchaAssessmentResponse = await response.json();

		if (data.error) {
			log.error({ code: data.error.code }, 'reCAPTCHA assessment error: %s', data.error.message);
			return {
				success: false,
				error: data.error.message
			};
		}

		if (!data.tokenProperties?.valid) {
			log.warn('invalid reCAPTCHA token');
			return {
				success: false,
				error: 'Invalid reCAPTCHA token'
			};
		}

		if (data.tokenProperties.action !== expectedAction) {
			log.warn(
				{ expectedAction, actualAction: data.tokenProperties.action },
				'reCAPTCHA action mismatch'
			);
			return {
				success: false,
				error: 'reCAPTCHA action mismatch'
			};
		}

		const score = data.riskAnalysis?.score ?? 0;

		if (score < riskScoreThreshold) {
			log.warn({ score, threshold: riskScoreThreshold }, 'reCAPTCHA score too low');
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
		log.error({ err: error }, 'reCAPTCHA verification error');

		let errorMessage = 'reCAPTCHA verification failed';
		if (error instanceof Error && error.message) {
			errorMessage = `${errorMessage}: ${error.message}`;
		}

		return {
			success: false,
			error: errorMessage
		};
	}
}
