# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> search shows an empty state without a query
- Location: tests/e2e/home.spec.ts:27:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Search everything on screen' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Search everything on screen' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Search everything on screen' })

```

```yaml
- banner:
  - link "Skip to content":
    - /url: "#main-content"
  - link "Marquee home":
    - /url: /
    - img "Marquee"
    - text: Marquee
  - navigation "Primary":
    - link "Movies":
      - /url: /movies
    - link "TV":
      - /url: /tv
    - link "Discover":
      - /url: /discover
  - link "Search… ⌘K":
    - /url: /search
  - button "Switch to light theme"
- main:
  - heading "Search" [level=1]
  - searchbox "Search movies, series, and people"
  - button "Search"
  - group "Result type":
    - text: Result type
    - link "All":
      - /url: /search?q=&type=all&page=1
    - link "Movies":
      - /url: /search?q=&type=movie&page=1
    - link "TV":
      - /url: /search?q=&type=tv&page=1
    - link "People":
      - /url: /search?q=&type=person&page=1
  - text: Search everything on screen Type at least 2 characters to search movies, series, and people.
- contentinfo:
  - img "Marquee"
  - text: Marquee
  - paragraph: Everything on screen.
  - navigation "Browse":
    - list:
      - listitem:
        - link "Movies":
          - /url: /movies
      - listitem:
        - link "TV":
          - /url: /tv
      - listitem:
        - link "Discover":
          - /url: /discover
      - listitem:
        - link "Search":
          - /url: /search
      - listitem:
        - link "Watchlist":
          - /url: /watchlist
  - navigation "Project":
    - list:
      - listitem:
        - link "About":
          - /url: /about
  - img "The Movie Database"
  - paragraph:
    - text: This product uses the TMDB API but is not endorsed or certified by TMDB.
    - link "themoviedb.org":
      - /url: https://www.themoviedb.org
  - paragraph: © 2026 Marquee · A personal, non-commercial project.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("home renders the hero and rails", async ({ page }) => {
  4  | 	await page.goto("/");
  5  | 	await expect(page.getByRole("region", { name: "Spotlight" })).toBeVisible();
  6  | 	await expect(
  7  | 		page.getByRole("heading", { name: "Trending now" })
  8  | 	).toBeVisible();
  9  | 	await expect(
  10 | 		page.getByRole("heading", { name: "Popular Movies" })
  11 | 	).toBeVisible();
  12 | 	await expect(
  13 | 		page.getByRole("link", { name: /More info/u }).first()
  14 | 	).toBeVisible();
  15 | });
  16 | 
  17 | test("movies hub paginates from the URL", async ({ page }) => {
  18 | 	await page.goto("/movies?category=popular&page=1");
  19 | 	await expect(
  20 | 		page.getByRole("heading", { name: "Movies", exact: true })
  21 | 	).toBeVisible();
  22 | 	await expect(
  23 | 		page.getByRole("link", { name: "2", exact: true })
  24 | 	).toBeVisible();
  25 | });
  26 | 
  27 | test("search shows an empty state without a query", async ({ page }) => {
  28 | 	await page.goto("/search");
  29 | 	await expect(
  30 | 		page.getByRole("heading", { name: "Search everything on screen" })
> 31 | 	).toBeVisible();
     |    ^ Error: expect(locator).toBeVisible() failed
  32 | });
  33 | 
```