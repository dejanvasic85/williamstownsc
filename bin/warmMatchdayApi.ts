#!/usr/bin/env tsx

// Best-effort warm-up call, run before `next build`'s static generation starts. The matchday
// API sits on a Neon compute that can scale to zero when idle; without this, the build's first
// wave of concurrent SSG requests could be the thing that wakes it up, all at once. This gives
// it one sequential request to wake on first, so it's warm before that concurrent load hits
// (docs/plans/2026-08-15-matchday-fixtures-table-swap.md has the fuller incident writeup).
// Never fails the build — a warm-up miss just means the existing unstable_cache-based
// degradation in the matchday services handles it, same as any other transient API hiccup.
import logger from '@/lib/logger';
import { getMatchdayClient, matchdayRequestTimeoutMs } from '@/lib/matchday/matchdayClient';

const log = logger.child({ module: 'warm-matchday-api' });
const maxAttempts = 3;

async function warmEndpoint(name: string, request: () => Promise<{ error?: unknown }>) {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const result = await request();
			if (!result.error) {
				log.info({ endpoint: name, attempt }, 'matchday API warm');
				return;
			}
			log.warn(
				{ endpoint: name, attempt, err: result.error },
				'matchday API warm-up attempt failed'
			);
		} catch (error) {
			// openapi-fetch rethrows network/abort errors rather than returning { error } for
			// them — catch here too, or a timeout on attempt 1 skips the remaining retries.
			log.warn({ endpoint: name, attempt, err: error }, 'matchday API warm-up attempt failed');
		}
	}
	log.warn({ endpoint: name }, 'matchday API still not warm after retries — proceeding with build');
}

async function main() {
	const client = getMatchdayClient();

	// Sequential, not parallel — the point is to let the compute wake up on one request before
	// the build's own concurrent load arrives, not to add to that concurrency here.
	await warmEndpoint('/teams', () =>
		client.GET('/teams', { signal: AbortSignal.timeout(matchdayRequestTimeoutMs) })
	);
	await warmEndpoint('/clubs', () =>
		client.GET('/clubs', { signal: AbortSignal.timeout(matchdayRequestTimeoutMs) })
	);
}

main().catch((error) => {
	log.warn({ err: error }, 'matchday API warm-up failed unexpectedly — proceeding with build');
});
