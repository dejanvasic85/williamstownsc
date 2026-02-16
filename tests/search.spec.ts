import { expect, test } from '@playwright/test';

test.describe('Search', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('opens search modal with keyboard shortcut and navigates to team page', async ({ page }) => {
		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle');

		await page.keyboard.press('Meta+k');

		const searchDialog = page.getByRole('dialog');
		await expect(searchDialog).toBeVisible({ timeout: 5000 });

		const searchInput = page.getByRole('textbox', { name: /search content/i });
		await searchInput.fill('north west');

		const firstResult = page.getByRole('button', { name: /north.?west/i }).first();
		await expect(firstResult).toBeVisible({ timeout: 10000 });
		await firstResult.click();

		await expect(page).toHaveURL(/\/football\/teams\//);
	});

	test('clears search input when modal is reopened after closing', async ({ page }) => {
		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle');

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
