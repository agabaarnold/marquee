import { expect, test } from "@playwright/test";

test("save from a detail page, header count, watchlist page, persistence", async ({
	page,
}) => {
	// Client hydration (not just SSR HTML) must finish before clicking:
	// pre-hydration clicks land on inert markup and toggle nothing.
	await page.goto("/movie/550");
	await page.waitForLoadState("networkidle");
	await page.getByRole("button", { name: "Watchlist", exact: true }).click();
	await expect(page.getByRole("button", { name: "Saved" })).toBeVisible({
		timeout: 15_000,
	});
	await expect(
		page.getByRole("link", { name: "Watchlist, 1 saved" })
	).toBeVisible();

	await page.goto("/watchlist");
	await expect(page.getByText("Fight Club").first()).toBeVisible();

	await page.reload();
	await expect(page.getByText("Fight Club").first()).toBeVisible();

	await page.getByRole("button", { name: /Remove Fight Club/u }).click();
	await expect(page.getByText("Nothing saved yet")).toBeVisible();
});
