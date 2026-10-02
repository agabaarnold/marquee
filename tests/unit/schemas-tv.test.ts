import { describe, expect, it } from "vitest";

import {
	EpisodeRaw,
	SeasonDetailsRaw,
	SeasonSummarySchema,
	TvDetailsSchema,
	TvSummarySchema,
	toSeasonDetails,
} from "#/schemas/tv.ts";

import { seasonDetails, tvDetails, tvSummary } from "../fixtures/tmdb";

describe("TvSummarySchema", () => {
	it("maps tv.name to title and first_air_date to date", () => {
		const summary = TvSummarySchema.parse(tvSummary);
		expect(summary).toMatchObject({
			mediaType: "tv",
			id: 1396,
			title: "Breaking Bad",
			date: "2008-01-20",
			year: 2008,
		});
	});
});

describe("TvDetailsSchema", () => {
	it("maps aggregate credits to cast and crew", () => {
		const details = TvDetailsSchema.parse(tvDetails);
		expect(details.mediaType).toBe("tv");
		expect(details.cast).toHaveLength(1);
		expect(details.cast[0]).toMatchObject({
			name: "Bryan Cranston",
			character: "Walter White",
		});
		expect(details.crew[0]).toMatchObject({
			name: "Vince Gilligan",
			job: "Director",
			department: "Directing",
		});
	});

	it("maps tv-specific fields", () => {
		const details = TvDetailsSchema.parse(tvDetails);
		expect(details.certification).toBe("TV-MA");
		expect(details.episodeRuntimeMinutes).toBe(49);
		expect(details.numberOfSeasons).toBe(5);
		expect(details.seriesType).toBe("Scripted");
		expect(details.inProduction).toBe(false);
		expect(details.creators).toEqual([
			{ id: 1, name: "Vince Gilligan", profilePath: null },
		]);
		expect(details.networks).toEqual([
			{ id: 174, name: "AMC", logoPath: null },
		]);
		expect(details.keywords).toEqual([{ id: 2, name: "drugs" }]);
		expect(details.lastEpisodeToAir).toMatchObject({ name: "Felina" });
		expect(details.nextEpisodeToAir).toBeNull();
		expect(details.seasons[0]).toMatchObject({
			seasonNumber: 1,
			rating: 8.2,
		});
	});
});

describe("season schemas", () => {
	it("parses episode rows", () => {
		const episode = EpisodeRaw.parse(seasonDetails.episodes[0]);
		expect(episode).toMatchObject({
			seasonNumber: 1,
			episodeNumber: 1,
			name: "Pilot",
			runtimeMinutes: 58,
		});
	});

	it("attaches the show id via toSeasonDetails", () => {
		const raw = SeasonDetailsRaw.parse(seasonDetails);
		const season = toSeasonDetails(raw, 1396);
		expect(season.showId).toBe(1396);
		expect(season.episodes).toHaveLength(1);
		expect(SeasonSummarySchema.parse(seasonDetails)).toMatchObject({
			episodeCount: 7,
		});
	});
});
