import { createMatchdayClient } from '@dejanvasic85/matchday-sdk';
import { getMatchdayConfig } from '@/lib/config';

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
