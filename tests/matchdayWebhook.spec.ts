import { expect, test } from '@playwright/test';
import {
	type MatchdayWebhookDependencies,
	handleMatchdayWebhook
} from '@/lib/matchday/matchdayWebhookService';

const webhookSecret = 'whsec_test';
const changedBody = JSON.stringify({
	leagueId: 'lea_abc123',
	hasChanges: true,
	crawledAt: '2026-08-29T12:00:00.000Z'
});

async function createSignatureHeader(body: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(webhookSecret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
	const signatureHex = Array.from(new Uint8Array(signature), (byte) =>
		byte.toString(16).padStart(2, '0')
	).join('');
	return `sha256=${signatureHex}`;
}

function createDependencies(revalidatedLeagues: string[]): MatchdayWebhookDependencies {
	return {
		webhookSecret,
		revalidateLeague: (leagueId) => revalidatedLeagues.push(leagueId)
	};
}

test.describe('Matchday webhook delivery', () => {
	test('revalidates the posted league when authenticated changes exist', async () => {
		const revalidatedLeagues: string[] = [];
		const outcome = await handleMatchdayWebhook(createDependencies(revalidatedLeagues), {
			rawBody: changedBody,
			signatureHeader: await createSignatureHeader(changedBody)
		});

		expect(outcome).toEqual({
			status: 'accepted',
			payload: JSON.parse(changedBody),
			revalidated: true
		});
		expect(revalidatedLeagues).toEqual(['lea_abc123']);
	});

	test('accepts an unchanged league without revalidation', async () => {
		const revalidatedLeagues: string[] = [];
		const body = JSON.stringify({
			leagueId: 'lea_abc123',
			hasChanges: false,
			crawledAt: '2026-08-29T12:00:00.000Z'
		});
		const outcome = await handleMatchdayWebhook(createDependencies(revalidatedLeagues), {
			rawBody: body,
			signatureHeader: await createSignatureHeader(body)
		});

		expect(outcome).toMatchObject({ status: 'accepted', revalidated: false });
		expect(revalidatedLeagues).toEqual([]);
	});

	test('rejects an invalid signature before revalidation', async () => {
		const revalidatedLeagues: string[] = [];
		const outcome = await handleMatchdayWebhook(createDependencies(revalidatedLeagues), {
			rawBody: changedBody,
			signatureHeader: 'sha256=00'
		});

		expect(outcome).toEqual({ status: 'unauthorized' });
		expect(revalidatedLeagues).toEqual([]);
	});

	test('rejects a signed malformed payload before revalidation', async () => {
		const revalidatedLeagues: string[] = [];
		const body = JSON.stringify({ leagueId: 'lea_abc123', hasChanges: 'yes' });
		const outcome = await handleMatchdayWebhook(createDependencies(revalidatedLeagues), {
			rawBody: body,
			signatureHeader: await createSignatureHeader(body)
		});

		expect(outcome).toEqual({ status: 'invalid-payload' });
		expect(revalidatedLeagues).toEqual([]);
	});
});
