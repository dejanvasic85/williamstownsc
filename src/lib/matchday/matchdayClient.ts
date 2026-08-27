import { createMatchdayClient } from '@dejanvasic85/matchday-sdk';
import { getMatchdayConfig } from '@/lib/config';

/** 30s rather than single-digit seconds: the Vercel build region and the matchday API's Neon
 * database are far apart (Cleveland US East vs. Singapore). */
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
