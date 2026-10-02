import { expect, test } from "@playwright/test";

test("save from a detail page, header count, watchlist page, persistence", async ({
	page,
}) => {
	// The save button is SSR-rendered before React hydrates, so a click
	// that lands too early toggles nothing. The root sets
	// data-hydrated on <html> once the client mounts.
	await page.goto("/movie/550");
	await expect(page.locator("html[data-hydrated='true']")).toBeAttached({
		timeout: 30_000,
	});
	await page.getByRole("button", { name: "Watchlist", exact: true }).click();
	await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
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
