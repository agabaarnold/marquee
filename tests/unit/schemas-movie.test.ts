import { describe, expect, it } from "vitest";

import { MovieDetailsSchema, MovieSummarySchema } from "#/schemas/movie.ts";
import { movieDetails, movieSummary, movieSummarySparse } from "../fixtures/tmdb";

describe("MovieSummarySchema", () => {
	it("normalizes a movie row to MediaSummary", () => {
		const summary = MovieSummarySchema.parse(movieSummary);
		expect(summary).toMatchObject({
			mediaType: "movie",
			id: 550,
			title: "Fight Club",
			originalTitle: "Fight Club",
			posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
			date: "1999-10-15",
			year: 1999,
			rating: 8.4,
			voteCount: 28000,
			genreIds: [18],
			originalLanguage: "en",
		});
	});

	it("normalizes null paths and empty dates", () => {
		const summary = MovieSummarySchema.parse(movieSummarySparse);
		expect(summary.posterPath).toBeNull();
		expect(summary.backdropPath).toBeNull();
		expect(summary.date).toBeNull();
		expect(summary.year).toBeNull();
	});
});

describe("MovieDetailsSchema", () => {
	it("maps a full details response to MovieDetails", () => {
		const details = MovieDetailsSchema.parse(movieDetails);
		expect(details.mediaType).toBe("movie");
		expect(details.tagline).toBe("Mischief. Mayhem. Soap.");
		expect(details.runtimeMinutes).toBe(139);
		expect(details.status).toBe("Released");
		// Empty homepage normalizes to null.
		expect(details.homepage).toBeNull();
		expect(details.budget).toBe(63000000);
		expect(details.collection).toBeNull();
		expect(details.productionCompanies).toHaveLength(1);
		expect(details.productionCompanies[0]).toMatchObject({
			id: 508,
			country: "US",
		});
		// Malformed cast row is dropped, valid rows survive.
		expect(details.cast).toHaveLength(1);
		expect(details.cast[0]).toMatchObject({
			name: "Edward Norton",
			character: "The Narrator",
		});
		expect(details.directors.map((person) => person.name)).toEqual([
			"David Fincher",
		]);
		expect(details.videos).toHaveLength(1);
		expect(details.videos[0]).toMatchObject({
			site: "YouTube",
			official: true,
		});
		expect(details.keywords).toEqual([{ id: 1, name: "fight" }]);
		expect(details.externalIds).toMatchObject({
			imdb: "tt0137523",
			x: "fightclub",
		});
	});

	it("prefers the US theatrical certification", () => {
		const details = MovieDetailsSchema.parse(movieDetails);
		expect(details.certification).toBe("R");
	});

	it("falls back to any rated region when the US is unrated", () => {
		const unrated = {
			...movieDetails,
			release_dates: {
				results: [
					{
						iso_3166_1: "US",
						release_dates: [{ certification: "", type: 3 }],
					},
					{
						iso_3166_1: "DE",
						release_dates: [{ certification: "16", type: 3 }],
					},
				],
			},
		};
		expect(MovieDetailsSchema.parse(unrated).certification).toBe("16");
	});

	it("yields null certification when nothing is rated", () => {
		const unrated = { ...movieDetails, release_dates: { results: [] } };
		expect(MovieDetailsSchema.parse(unrated).certification).toBeNull();
	});
});
