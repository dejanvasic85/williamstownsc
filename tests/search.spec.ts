import { expect, test } from '@playwright/test';

test.describe('Search', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('opens search modal with keyboard shortcut and navigates to result page', async ({
		page
	}) => {
		await page.waitForLoadState('domcontentloaded');

		// Intercept search API to capture results
		const searchResponsePromise = page.waitForResponse(
			(resp) => resp.url().includes('/api/search') && resp.status() === 200
		);

		await page.keyboard.press('Meta+k');

		const searchDialog = page.getByRole('dialog');
		await expect(searchDialog).toBeVisible({ timeout: 5000 });

		const searchInput = page.getByRole('textbox', { name: /search content/i });
		await searchInput.fill('north west');

		const searchResponse = await searchResponsePromise;
		const { results } = await searchResponse.json();
		const firstResultUrl = results[0].url;

		const firstResult = page.getByRole('button', { name: /north.?west/i }).first();
		await expect(firstResult).toBeVisible({ timeout: 10000 });
		await firstResult.click();

		await expect(page).toHaveURL(firstResultUrl);
	});

	test('clears search input when modal is reopened after closing', async ({ page }) => {
		await page.waitForLoadState('domcontentloaded');

		const searchButton = page.getByRole('button', { name: /search/i, exact: false }).first();
		await searchButton.click();

		const searchDialog = page.getByRole('dialog');
		await expect(searchDialog).toBeVisible({ timeout: 5000 });

		const searchInput = page.getByRole('textbox', { name: /search content/i });
		await searchInput.fill('summer');
		await expect(searchInput).toHaveValue('summer');

		await page.keyboard.press('Escape');
		await expect(searchDialog).not.toBeVisible();

		await searchButton.click();
		await expect(searchDialog).toBeVisible();

		const reopenedSearchInput = page.getByRole('textbox', { name: /search content/i });
		await expect(reopenedSearchInput).toHaveValue('');
	});
});
