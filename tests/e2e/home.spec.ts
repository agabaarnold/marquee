import { expect, test } from "@playwright/test";

test("home renders the hero and rails", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("region", { name: "Spotlight" })).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Trending now" })
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Popular Movies" })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: /More info/u }).first()
	).toBeVisible();
});

test("movies hub paginates from the URL", async ({ page }) => {
	await page.goto("/movies?category=popular&page=1");
	await expect(
		page.getByRole("heading", { name: "Movies", exact: true })
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "2", exact: true })
	).toBeVisible();
});

test("search shows an empty state without a query", async ({ page }) => {
	await page.goto("/search");
	await expect(page.getByText("Search everything on screen")).toBeVisible();
});
