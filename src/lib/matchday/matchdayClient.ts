import { createMatchdayClient } from '@dejanvasic85/matchday-sdk';
import { getMatchdayConfig } from '@/lib/config';

/** Shared across every matchday*Service.ts call — one place to tune request timeouts.
 * 30s, not the more typical single-digit seconds — the Vercel build region and the matchday
 * API's Neon database are geographically distant (Cleveland US East vs. Singapore), and even a
 * single solo request has been observed taking close to 20s during a build. */
export const matchdayRequestTimeoutMs = 30_000;

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
