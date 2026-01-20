import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('loads successfully', async ({ page }) => {
		await expect(page).toHaveTitle(/Williamstown/i);
	});

	test('displays hero carousel', async ({ page }) => {
		const carousel = page.getByRole('region', {
			name: /featured news/i
		});
		await expect(carousel).toBeVisible();
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
		const nextMatchHeading = page.getByRole('heading', {
			name: /next match/i
		});
		await expect(nextMatchHeading).toBeVisible();
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

	test('carousel has proper ARIA labels', async ({ page }) => {
		const carousel = page.getByRole('region', {
			name: /featured news/i
		});
		await expect(carousel).toHaveAttribute('aria-label', /featured news/i);
	});

	test('carousel navigation buttons are accessible', async ({ page }) => {
		const nextButton = page.getByRole('button', {
			name: /go to next slide/i
		});
		const prevButton = page.getByRole('button', {
			name: /go to previous slide/i
		});

		await expect(nextButton).toBeVisible();
		await expect(prevButton).toBeVisible();
	});

	test('carousel play/pause controls are accessible', async ({ page }) => {
		const pauseButton = page.getByRole('button', { name: /pause carousel/i });
		const playButton = page.getByRole('button', { name: /play carousel/i });

		const pauseCount = await pauseButton.count();
		const playCount = await playButton.count();

		// Either pause or play button should be visible depending on carousel state
		expect(pauseCount + playCount).toBeGreaterThan(0);
	});
});
