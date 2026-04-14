import { expect, test } from '@playwright/test';

test.describe('Key Dates Page', () => {
	test('renders the timeline without client-side navigation errors', async ({ page }) => {
		const pageErrors: string[] = [];

		page.on('pageerror', (error) => {
			pageErrors.push(error.message);
		});

		await page.goto('/key-dates');

		await expect(page).toHaveTitle(/Williamstown/i);
		await expect(page.getByRole('heading', { name: /key dates/i })).toBeVisible();

		const timeline = page.getByLabel('Season timeline');
		await expect(timeline).toBeVisible();

		const timelineItems = timeline.locator('article[id^="key-date-"]');
		await expect(timelineItems.first()).toBeVisible();
		await expect(timelineItems).toHaveCount(await timelineItems.count());

		expect(pageErrors).toEqual([]);
	});
});
