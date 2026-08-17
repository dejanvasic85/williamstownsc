import { createMatchdayClient } from '@dejanvasic85/matchday-sdk';
import { getMatchdayConfig } from '@/lib/config';

/** Shared across every matchday*Service.ts call — one place to tune request timeouts. */
export const matchdayRequestTimeoutMs = 10_000;

type MatchdayClient = ReturnType<typeof createMatchdayClient>;

let cachedClient: MatchdayClient | null = null;

export function getMatchdayClient(): MatchdayClient {
	if (cachedClient) {
		return cachedClient;
	}

	const { matchdayApiToken, matchdayApiBaseUrl } = getMatchdayConfig();
	cachedClient = createMatchdayClient({
		baseUrl: matchdayApiBaseUrl,
		apiToken: matchdayApiToken
	});

	return cachedClient;
}
