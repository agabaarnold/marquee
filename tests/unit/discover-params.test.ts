import { describe, expect, it } from "vitest";

import { toDiscoverParams } from "#/schemas/discover.ts";

const base = {
	type: "movie",
	genres: [],
	minRating: 0,
	sort: "popularity.desc",
	providers: [],
	page: 1,
} as const;

describe("toDiscoverParams", () => {
	it("maps movie filters to TMDB names", () => {
		const params = toDiscoverParams("movie", {
			...base,
			genres: [28, 12],
			yearFrom: 2000,
			yearTo: 2010,
			minRating: 7,
			sort: "vote_average.desc",
			providers: [8],
			region: "US",
			page: 2,
		});
		expect(params).toMatchObject({
			"primary_release_date.gte": "2000-01-01",
			"primary_release_date.lte": "2010-12-31",
			with_genres: "28,12",
			"vote_average.gte": 7,
			"vote_count.gte": 50,
			sort_by: "vote_average.desc",
			with_watch_providers: "8",
			watch_region: "US",
			page: 2,
			include_adult: false,
		});
	});

	it("uses first_air_date keys and remaps tv-incompatible sorts", () => {
		const dateSort = toDiscoverParams("tv", {
			...base,
			type: "tv",
			yearFrom: 2020,
			sort: "primary_release_date.desc",
		});
		expect(dateSort["first_air_date.gte"]).toBe("2020-01-01");
		expect(dateSort["primary_release_date.gte"]).toBeUndefined();
		expect(dateSort.sort_by).toBe("first_air_date.desc");

		const revenueSort = toDiscoverParams("tv", {
			...base,
			type: "tv",
			sort: "revenue.desc",
		});
		expect(revenueSort.sort_by).toBe("popularity.desc");
	});

	it("omits empty filters and defaults the provider region", () => {
		const params = toDiscoverParams("movie", { ...base });
		expect(params.with_genres).toBeUndefined();
		expect(params["vote_average.gte"]).toBeUndefined();
		const withProviders = toDiscoverParams("movie", {
			...base,
			providers: [8],
		});
		expect(withProviders.watch_region).toBe("US");
	});
});
