import { describe, expect, it } from "vitest";

import { imageSrcSet, imageUrl } from "#/lib/images.ts";
import { searchHref } from "#/lib/search-params.ts";
import { mediaPath, mediaSlugParam, slugify } from "#/lib/slug.ts";
import { IdSlugParam, SeasonParam } from "#/schemas/discover.ts";

describe("slugify", () => {
	it("lowercases, strips diacritics and punctuation", () => {
		expect(slugify("Fight Club")).toBe("fight-club");
		expect(slugify("Amélie")).toBe("amelie");
		expect(slugify("  Star Wars: IV  ")).toBe("star-wars-iv");
		expect(slugify("")).toBe("");
	});
});

describe("mediaSlugParam", () => {
	it("prefixes the id and falls back to the bare id", () => {
		expect(mediaSlugParam({ id: 550, title: "Fight Club" })).toBe(
			"550-fight-club"
		);
		expect(mediaSlugParam({ id: 11, title: "!!!" })).toBe("11");
	});
});

describe("mediaPath", () => {
	it("builds movie and tv paths", () => {
		expect(
			mediaPath({ mediaType: "movie", id: 550, title: "Fight Club" })
		).toBe("/movie/550-fight-club");
		expect(
			mediaPath({ mediaType: "tv", id: 1396, title: "Breaking Bad" })
		).toBe("/tv/1396-breaking-bad");
	});
});

describe("IdSlugParam", () => {
	it("splits id and slug", () => {
		expect(IdSlugParam.parse("550-fight-club")).toEqual({
			id: 550,
			slug: "fight-club",
		});
		expect(IdSlugParam.parse("550")).toEqual({ id: 550, slug: "" });
	});

	it("rejects non-numeric ids", () => {
		expect(() => IdSlugParam.parse("abc")).toThrow();
	});
});

describe("SeasonParam", () => {
	it("coerces numeric strings with a default", () => {
		expect(SeasonParam.parse("2")).toBe(2);
		expect(SeasonParam.parse(undefined)).toBe(1);
	});
});

describe("imageUrl and imageSrcSet", () => {
	it("builds CDN urls and nulls for missing paths", () => {
		expect(imageUrl("/p.jpg", 342)).toBe(
			"https://image.tmdb.org/t/p/w342/p.jpg"
		);
		expect(imageUrl(null, 342)).toBeNull();
		expect(imageSrcSet("poster", "/p.jpg")).toContain("w342/p.jpg 342w");
		expect(imageSrcSet("poster", null)).toBeUndefined();
	});
});

describe("searchHref", () => {
	it("round-trips arrays, numbers, and tricky strings", () => {
		expect(searchHref("/movies", { category: "popular", page: 2 })).toBe(
			"/movies?category=popular&page=2"
		);
		expect(
			searchHref("/discover", { genres: [28, 12], type: "movie", page: 1 })
		).toContain("genres=%5B28%2C12%5D");
		// A numeric query must stay a string so z.string() accepts it.
		expect(searchHref("/search", { q: "2024" })).toContain("q=%222024%22");
		expect(searchHref("/search", { q: "" })).toBe("/search");
	});
});
