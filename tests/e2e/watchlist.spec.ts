import { expect, test } from "@playwright/test";

test("save from a detail page, header count, watchlist page, persistence", async ({
	page,
}) => {
	await page.goto("/movie/550");
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
