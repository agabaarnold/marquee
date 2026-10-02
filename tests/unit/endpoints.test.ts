// @vitest-environment node
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
	TmdbNotFoundError,
	TmdbRateLimitError,
	TmdbSchemaError,
} from "#/server/errors/index.ts";
import {
	discover,
	genres,
	list,
	movieDetails,
	providers,
	search,
	season,
	trending,
	tvDetails,
} from "#/server/tmdb/endpoints.ts";

import {
	discoverPage,
	genresList,
	movieDetails as movieDetailsFixture,
	movieSummary,
	providersList,
	trendingPage,
	tvDetails as tvDetailsFixture,
} from "../fixtures/tmdb";

const BASE = "https://api.themoviedb.org/3";

const server = setupServer();

beforeAll(() => {
	server.listen();
});
afterEach(() => {
	server.resetHandlers();
});
afterAll(() => {
	server.close();
});

describe("trending", () => {
	it("parses a trending page", async () => {
		server.use(
			http.get(`${BASE}/trending/all/week`, () =>
				HttpResponse.json(trendingPage)
			)
		);
		const page = await trending("all", "week");
		expect(page.results).toHaveLength(2);
		expect(page.totalPages).toBe(500);
	});
});

describe("movieDetails", () => {
	it("sends append_to_response and parses details", async () => {
		let append = "";
		server.use(
			http.get(`${BASE}/movie/550`, ({ request }) => {
				append =
					new URL(request.url).searchParams.get("append_to_response") ?? "";
				return HttpResponse.json(movieDetailsFixture);
			})
		);
		const details = await movieDetails(550);
		expect(append).toContain("credits");
		expect(details.title).toBe("Fight Club");
	});

	it("maps 404 to TmdbNotFoundError", async () => {
		server.use(
			http.get(`${BASE}/movie/0`, () => new HttpResponse(null, { status: 404 }))
		);
		await expect(movieDetails(0)).rejects.toBeInstanceOf(TmdbNotFoundError);
	});

	it("maps schema mismatches to TmdbSchemaError", async () => {
		server.use(
			http.get(`${BASE}/movie/1`, () => HttpResponse.json({ nope: true }))
		);
		await expect(movieDetails(1)).rejects.toBeInstanceOf(TmdbSchemaError);
	});

	it("retries a 429 then succeeds", async () => {
		let calls = 0;
		server.use(
			http.get(`${BASE}/movie/2`, () => {
				calls += 1;
				return calls === 1
					? new HttpResponse(null, { status: 429 })
					: HttpResponse.json(movieDetailsFixture);
			})
		);
		const details = await movieDetails(2);
		expect(details.id).toBe(550);
		expect(calls).toBe(2);
	});

	it("raises TmdbRateLimitError after exhausting retries", async () => {
		server.use(
			http.get(`${BASE}/movie/3`, () => new HttpResponse(null, { status: 429 }))
		);
		await expect(movieDetails(3)).rejects.toBeInstanceOf(TmdbRateLimitError);
	});
});

describe("list", () => {
	it("rejects unknown categories without a request", () => {
		expect(() => list("movie", "nope")).toThrow();
	});
});

describe("season", () => {
	it("attaches the show id", async () => {
		server.use(
			http.get(`${BASE}/tv/1396/season/1`, () =>
				HttpResponse.json({
					id: 3577,
					season_number: 1,
					name: "Season 1",
					overview: "",
					air_date: "2008-01-20",
					episode_count: 7,
					poster_path: null,
					vote_average: 8.2,
					episodes: [],
				})
			)
		);
		const result = await season(1396, 1);
		expect(result.showId).toBe(1396);
		expect(result.seasonNumber).toBe(1);
	});
});

describe("search", () => {
	it("maps multi results to media and person variants", async () => {
		server.use(
			http.get(`${BASE}/search/multi`, () =>
				HttpResponse.json({
					page: 1,
					results: [
						{ ...movieSummary, media_type: "movie" },
						{
							media_type: "person",
							id: 819,
							name: "Edward Norton",
							profile_path: null,
							known_for_department: "Acting",
						},
					],
					total_pages: 1,
					total_results: 2,
				})
			)
		);
		const page = await search("norton", "multi");
		expect(
			page.results.map((item) => ("kind" in item ? item.kind : "media"))
		).toEqual(["media", "person"]);
	});
});

describe("discover", () => {
	it("serializes genre arrays for TMDB", async () => {
		let genresParam = "";
		server.use(
			http.get(`${BASE}/discover/movie`, ({ request }) => {
				genresParam =
					new URL(request.url).searchParams.get("with_genres") ?? "";
				return HttpResponse.json(discoverPage);
			})
		);
		const page = await discover("movie", {
			type: "movie",
			genres: [28, 12],
			minRating: 0,
			sort: "popularity.desc",
			providers: [],
			page: 1,
		});
		expect(genresParam).toBe("28,12");
		expect(page.results).toHaveLength(2);
	});
});

describe("genres and providers", () => {
	it("unwraps genre and provider lists", async () => {
		server.use(
			http.get(`${BASE}/genre/movie/list`, () => HttpResponse.json(genresList))
		);
		server.use(
			http.get(`${BASE}/watch/providers/movie`, () =>
				HttpResponse.json(providersList)
			)
		);
		expect(await genres("movie")).toEqual(genresList.genres);
		const providerList = await providers("movie", "US");
		expect(providerList.results[0]).toMatchObject({ name: "Netflix" });
	});
});

describe("tvDetails", () => {
	it("parses tv details", async () => {
		server.use(
			http.get(`${BASE}/tv/1396`, () => HttpResponse.json(tvDetailsFixture))
		);
		const details = await tvDetails(1396);
		expect(details.certification).toBe("TV-MA");
	});
});
