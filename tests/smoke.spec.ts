import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
	test('loads successfully', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Williamstown/i);
	});

	test('displays hero carousel', async ({ page }) => {
		await page.goto('/');
		const carousel = page.getByRole('region', {
			name: /featured news/i
		});
		await expect(carousel).toBeVisible();
	});

	test('displays sponsors section if available', async ({ page }) => {
		await page.goto('/');
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
		await page.goto('/');
		const nextMatchHeading = page.getByRole('heading', {
			name: /next match/i
		});
		await expect(nextMatchHeading).toBeVisible();
	});

	test('displays key dates section', async ({ page }) => {
		await page.goto('/');
		const keyDatesHeading = page.getByRole('heading', {
			name: /key dates/i
		});
		await expect(keyDatesHeading).toBeVisible();
	});

	test('carousel controls work', async ({ page }) => {
		await page.goto('/');

		const pauseButton = page.getByRole('button', { name: /pause/i });
		const playButton = page.getByRole('button', { name: /play/i });

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
			name: /next slide/i
		});
		const prevButton = page.getByRole('button', {
			name: /previous slide/i
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
		const carousel = page.getByRole('region', {
			name: /featured news/i
		});
		await expect(carousel).toBeVisible();
	});

	test('renders on tablet viewport', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');
		await expect(page).toHaveTitle(/Williamstown/i);
		const carousel = page.getByRole('region', {
			name: /featured news/i
		});
		await expect(carousel).toBeVisible();
	});

	test('renders on desktop viewport', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');
		await expect(page).toHaveTitle(/Williamstown/i);
		const carousel = page.getByRole('region', {
			name: /featured news/i
		});
		await expect(carousel).toBeVisible();
	});
});

test.describe('Accessibility', () => {
	test('carousel has proper ARIA labels', async ({ page }) => {
		await page.goto('/');
		const carousel = page.getByRole('region', {
			name: /featured news/i
		});
		await expect(carousel).toHaveAttribute('aria-label');
	});

	test('navigation buttons have accessible labels', async ({ page }) => {
		await page.goto('/');

		const nextButton = page.getByRole('button', {
			name: /next slide/i
		});
		const prevButton = page.getByRole('button', {
			name: /previous slide/i
		});
		const pauseButton = page.getByRole('button', { name: /pause/i });
		const playButton = page.getByRole('button', { name: /play/i });

		const nextCount = await nextButton.count();
		const prevCount = await prevButton.count();
		const pauseCount = await pauseButton.count();
		const playCount = await playButton.count();

		if (nextCount > 0) {
			await expect(nextButton).toHaveAttribute('aria-label');
		}
		if (prevCount > 0) {
			await expect(prevButton).toHaveAttribute('aria-label');
		}
		if (pauseCount > 0) {
			await expect(pauseButton).toHaveAttribute('aria-label');
		}
		if (playCount > 0) {
			await expect(playButton).toHaveAttribute('aria-label');
		}
	});
});
