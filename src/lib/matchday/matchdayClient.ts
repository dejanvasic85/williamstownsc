import { createMatchdayClient } from '@dejanvasic85/matchday-sdk';
import { getMatchdayConfig } from '@/lib/config';

/** The SDK applies these per request and retries idempotent calls itself, so services no longer
 * pass an `AbortSignal.timeout()` of their own. 30s, not the more typical single-digit seconds:
 * the Vercel build region and the matchday API's Neon database are geographically distant
 * (Cleveland US East vs. Singapore). */
const clientOptionsValue = {
	timeoutMs: 30_000,
	retries: 2,
	retryDelayMs: 250
} as const;

type MatchdayClient = ReturnType<typeof createMatchdayClient>;

let cachedClient: MatchdayClient | null = null;

export function getMatchdayClient(): MatchdayClient {
	if (cachedClient) {
		return cachedClient;
	}

	const { matchdayApiToken, matchdayApiBaseUrl } = getMatchdayConfig();
	cachedClient = createMatchdayClient({
		baseUrl: matchdayApiBaseUrl,
		apiToken: matchdayApiToken,
		...clientOptionsValue
	});

	return cachedClient;
}
