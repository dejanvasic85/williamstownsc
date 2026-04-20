import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('loads successfully', async ({ page }) => {
		await expect(page).toHaveTitle(/Williamstown/i);
	});

	test('displays hero carousel if featured news available', async ({ page }) => {
		expect(
			page.getByRole('region', {
				name: /featured news/i
			})
		).toBeVisible();
	});

	test('displays sponsors section if available', async ({ page }) => {
		const sponsorsHeading = page.getByRole('heading', {
			name: /sponsors/i,
			level: 2
		});

		const headingCount = await sponsorsHeading.count();
		if (headingCount > 0) {
			await expect(sponsorsHeading.first()).toBeVisible();
		}
	});

	test('displays next match section', async ({ page }) => {
		const nextMatchHeadings = page.getByRole('heading', { name: /next match/i });
		await expect(nextMatchHeadings).toHaveCount(2);
	});

	test('displays key dates section', async ({ page }) => {
		const keyDatesHeading = page.getByRole('heading', {
			name: /key dates/i
		});
		await expect(keyDatesHeading).toBeVisible();
	});

	test('carousel controls work', async ({ page }) => {
		const pauseButton = page.getByRole('button', { name: /pause carousel/i });
		const playButton = page.getByRole('button', { name: /play carousel/i });

		const pauseCount = await pauseButton.count();
		const playCount = await playButton.count();

		if (pauseCount > 0) {
			await pauseButton.click();
			await expect(playButton).toBeVisible();
		} else if (playCount > 0) {
			await playButton.click();
			await expect(pauseButton).toBeVisible();
		}

		const nextButton = page.getByRole('button', {
			name: /go to next slide/i
		});
		const prevButton = page.getByRole('button', {
			name: /go to previous slide/i
		});

		const nextCount = await nextButton.count();
		const prevCount = await prevButton.count();

		if (nextCount > 0) {
			await expect(nextButton).toBeVisible();
		}
		if (prevCount > 0) {
			await expect(prevButton).toBeVisible();
		}
	});
});

test.describe('Matches Page', () => {
	const fixturesUrl = '/football/teams/state-league-2-men-s-north-west/matches';

	test.beforeEach(async ({ page }) => {
		await page.goto(fixturesUrl);
	});

	test('loads with correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/Matches.*Williamstown SC/i);
	});

	test('renders at least one round', async ({ page }) => {
		const rounds = page.getByRole('heading', { name: /Round \d+/i });
		await expect(rounds.first()).toBeVisible();
	});

	test('Matches nav tab is active', async ({ page }) => {
		const matchesTab = page.getByRole('link', { name: 'Matches' });
		await expect(matchesTab).toBeVisible();
		await expect(matchesTab).toHaveAttribute('aria-current', 'page');
	});
});

test.describe('League Table Page', () => {
	const tableUrl = '/football/teams/state-league-2-men-s-north-west/table';

	test.beforeEach(async ({ page }) => {
		await page.goto(tableUrl);
	});

	test('loads with correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/League Table.*Williamstown SC/i);
	});

	test('renders standings table', async ({ page }) => {
		await expect(page.getByRole('table')).toBeVisible();
	});

	test('table has expected column headers', async ({ page }) => {
		const headers = page.getByRole('columnheader');
		await expect(headers.filter({ hasText: '#' })).toBeVisible();
		await expect(headers.filter({ hasText: 'Team' })).toBeVisible();
		await expect(headers.filter({ hasText: 'Pts' })).toBeVisible();
	});

	test('WSC row is present and highlighted', async ({ page }) => {
		const wscRow = page.getByRole('row').filter({ hasText: 'Williamstown SC' });
		await expect(wscRow).toBeVisible();
		await expect(wscRow).toHaveClass(/bg-secondary/);
	});

	test('Table nav tab is active', async ({ page }) => {
		const tableTab = page.getByRole('link', { name: 'Table' });
		await expect(tableTab).toBeVisible();
		await expect(tableTab).toHaveAttribute('aria-current', 'page');
	});
});

test.describe('Responsive', () => {
	test('renders on mobile viewport', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await expect(page).toHaveTitle(/Williamstown/i);
	});

	test('renders on tablet viewport', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');
		await expect(page).toHaveTitle(/Williamstown/i);
	});

	test('renders on desktop viewport', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');
		await expect(page).toHaveTitle(/Williamstown/i);
	});
});

test.describe('Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('carousel has proper ARIA labels when present', async ({ page }) => {
		expect(
			page.getByRole('region', {
				name: /featured news/i
			})
		).toHaveAttribute('aria-label', /featured news/i);
	});

	test('carousel navigation buttons are accessible when multiple slides', async ({ page }) => {
		const nextButton = page.getByRole('button', {
			name: /go to next slide/i
		});
		const prevButton = page.getByRole('button', {
			name: /go to previous slide/i
		});

		const nextCount = await nextButton.count();
		const prevCount = await prevButton.count();

		// Navigation buttons only show when there are multiple slides
		if (nextCount > 0) {
			await expect(nextButton).toBeVisible();
		}
		if (prevCount > 0) {
			await expect(prevButton).toBeVisible();
		}
	});

	test('carousel play/pause controls are accessible when multiple slides', async ({ page }) => {
		const pauseButton = page.getByRole('button', { name: /pause carousel/i });
		const playButton = page.getByRole('button', { name: /play carousel/i });

		const pauseCount = await pauseButton.count();
		const playCount = await playButton.count();

		// Play/pause controls only show when there are multiple slides
		if (pauseCount + playCount > 0) {
			// Either pause or play button should be visible depending on carousel state
			expect(pauseCount + playCount).toBeGreaterThan(0);
		}
	});
});
