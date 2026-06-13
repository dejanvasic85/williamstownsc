import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findClubExternalId } from '@/lib/clubService';
import type { ExternalFixture } from '@/types/matches';
import { transformExternalFixture } from './fixtureTransformService';

vi.mock('@/lib/clubService', () => ({
	findClubExternalId: vi.fn(() => 'club-id-123')
}));

const mockFindClubExternalId = vi.mocked(findClubExternalId);

function makeFixture(overrides: Partial<ExternalFixture['attributes']> = {}): ExternalFixture {
	return {
		type: 'fixtures',
		hash_id: 'abc123',
		links: { self: { href: 'https://fv.dribl.com/fixture/abc123' } },
		attributes: {
			name: 'Home FC vs Away FC',
			date: '2026-06-13T23:00:00.000000Z',
			round: 'R7',
			full_round: 'Round 7',
			ground_name: 'Williamstown Park',
			field_name: 'Pitch 1',
			ground_latitude: -37.86,
			ground_longitude: 144.9,
			ground_address: null,
			is_historic_field: false,
			home_team_name: 'Home FC',
			home_logo: 'https://cdn.dribl.com/home.png',
			away_team_name: 'Away FC',
			away_logo: 'https://cdn.dribl.com/away.png',
			competition_name: 'Junior Girls Sunday (U12 - U18)',
			league_name: "Girls' West 12B",
			status: 'pending',
			bye_flag: false,
			is_unstructured: false,
			league_result_access: 'public',
			home_score: null,
			home_score_extra: null,
			home_score_penalty: null,
			home_score_half: null,
			home_score_extra_half: null,
			away_score: null,
			away_score_extra: null,
			away_score_penalty: null,
			away_score_half: null,
			away_score_extra_half: null,
			allocated_center_referee: false,
			allocated_assistant_referee_1: false,
			allocated_assistant_referee_2: false,
			allocated_fourth_official: false,
			allocated_game_leader: false,
			referee_count: 0,
			enable_referees_allocated: false,
			match_hash_id: 'match-abc',
			forfeit_team_hash_id: null,
			home_team_hash_id: 'home-hash',
			away_team_hash_id: 'away-hash',
			...overrides
		}
	};
}

describe('transformExternalFixture', () => {
	beforeEach(() => {
		mockFindClubExternalId.mockReturnValue('club-id-123');
	});

	describe('date and time (Melbourne timezone)', () => {
		it('converts ISO UTC date crossing midnight to Melbourne date, day and time', () => {
			// 2026-06-13 23:00 UTC = 2026-06-14 09:00 AEST (Sunday)
			const result = transformExternalFixture(makeFixture({ date: '2026-06-13T23:00:00.000000Z' }));

			expect(result.date).toBe('2026-06-14');
			expect(result.day).toBe('Sunday');
			expect(result.time).toBe('09:00');
		});

		it('converts results API format (space separator, no Z) to Melbourne date and time', () => {
			// 2026-04-25 23:00:00 UTC = 2026-04-26 09:00 AEST (Sunday)
			const result = transformExternalFixture(makeFixture({ date: '2026-04-25 23:00:00' }));

			expect(result.date).toBe('2026-04-26');
			expect(result.day).toBe('Sunday');
			expect(result.time).toBe('09:00');
		});

		it('converts results API UTC time that does not cross midnight', () => {
			// 2026-04-26 03:15:00 UTC = 2026-04-26 13:15 AEST (Sunday)
			const result = transformExternalFixture(makeFixture({ date: '2026-04-26 03:15:00' }));

			expect(result.date).toBe('2026-04-26');
			expect(result.day).toBe('Sunday');
			expect(result.time).toBe('13:15');
		});

		it('handles a Saturday game correctly', () => {
			// 2026-06-12 23:00 UTC = 2026-06-13 09:00 AEST (Saturday)
			const result = transformExternalFixture(makeFixture({ date: '2026-06-12T23:00:00.000000Z' }));

			expect(result.date).toBe('2026-06-13');
			expect(result.day).toBe('Saturday');
			expect(result.time).toBe('09:00');
		});
	});

	describe('round', () => {
		it('strips the R prefix and parses as a number', () => {
			const result = transformExternalFixture(makeFixture({ round: 'R7' }));
			expect(result.round).toBe(7);
		});

		it('parses double-digit round numbers', () => {
			const result = transformExternalFixture(makeFixture({ round: 'R14' }));
			expect(result.round).toBe(14);
		});
	});

	describe('address', () => {
		it('combines ground_name and field_name', () => {
			const result = transformExternalFixture(
				makeFixture({ ground_name: 'Williamstown Park', field_name: 'Pitch 1' })
			);
			expect(result.address).toBe('Williamstown Park Pitch 1');
		});

		it('uses only ground_name when field_name is absent', () => {
			const result = transformExternalFixture(
				makeFixture({ ground_name: 'Williamstown Park', field_name: null })
			);
			expect(result.address).toBe('Williamstown Park');
		});

		it('returns empty string when ground_name is absent', () => {
			const result = transformExternalFixture(makeFixture({ ground_name: null, field_name: null }));
			expect(result.address).toBe('');
		});
	});

	describe('coordinates', () => {
		it('combines latitude and longitude', () => {
			const result = transformExternalFixture(
				makeFixture({ ground_latitude: -37.86, ground_longitude: 144.9 })
			);
			expect(result.coordinates).toBe('-37.86,144.9');
		});

		it('returns empty string when coordinates are null', () => {
			const result = transformExternalFixture(
				makeFixture({ ground_latitude: null, ground_longitude: null })
			);
			expect(result.coordinates).toBe('');
		});
	});

	describe('scores', () => {
		it('omits score fields when null (upcoming fixture)', () => {
			const result = transformExternalFixture(makeFixture({ home_score: null, away_score: null }));
			expect(result.homeScore).toBeUndefined();
			expect(result.awayScore).toBeUndefined();
		});

		it('includes scores when present (completed fixture)', () => {
			const result = transformExternalFixture(
				makeFixture({ home_score: 2, away_score: 1, home_score_half: 1, away_score_half: 0 })
			);
			expect(result.homeScore).toBe(2);
			expect(result.awayScore).toBe(1);
			expect(result.homeScoreHalf).toBe(1);
			expect(result.awayScoreHalf).toBe(0);
		});
	});

	describe('team IDs', () => {
		it('resolves team IDs via findClubExternalId', () => {
			mockFindClubExternalId
				.mockReturnValueOnce('home-club-id')
				.mockReturnValueOnce('away-club-id');

			const result = transformExternalFixture(makeFixture());

			expect(result.homeTeamId).toBe('home-club-id');
			expect(result.awayTeamId).toBe('away-club-id');
		});

		it('uses bye when home team name or logo is null', () => {
			const result = transformExternalFixture(
				makeFixture({ home_team_name: null, home_logo: null })
			);
			expect(result.homeTeamId).toBe('bye');
		});

		it('uses bye when away team name or logo is null', () => {
			const result = transformExternalFixture(
				makeFixture({ away_team_name: null, away_logo: null })
			);
			expect(result.awayTeamId).toBe('bye');
		});
	});
});
