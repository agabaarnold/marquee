import { describe, expect, it } from "vitest";

import { pagedLenient } from "#/schemas/common.ts";
import { PersonSchema } from "#/schemas/person.ts";
import {
	MediaFromAny,
	PersonResultSchema,
	SearchResultSchema,
} from "#/schemas/search.ts";
import {
	personDetails,
	searchMultiPage,
	trendingPage,
} from "../fixtures/tmdb";

describe("MediaFromAny", () => {
	it("parses mixed trending pages, dropping person and malformed rows", () => {
		const page = pagedLenient(MediaFromAny).parse(trendingPage);
		expect(page.results).toHaveLength(2);
		expect(page.results.map((item) => item.title)).toEqual([
			"Fight Club",
			"Breaking Bad",
		]);
		// TMDB pagination caps at 500.
		expect(page.totalPages).toBe(500);
	});
});

describe("SearchResultSchema", () => {
	it("parses person rows with and without a discriminator", () => {
		const multi = SearchResultSchema.parse(searchMultiPage.results[1]);
		expect(multi).toMatchObject({ kind: "person", knownFor: "Acting" });
		const direct = PersonResultSchema.parse({
			id: 819,
			name: "Edward Norton",
			profile_path: null,
			known_for_department: "Acting",
		});
		expect(direct).toMatchObject({ kind: "person", id: 819 });
	});

	it("maps a movie row to the media variant", () => {
		const media = SearchResultSchema.parse(searchMultiPage.results[0]);
		expect(media).toMatchObject({ kind: "media", mediaType: "movie" });
	});
});

describe("PersonSchema", () => {
	it("maps combined credits to person credits", () => {
		const person = PersonSchema.parse(personDetails);
		expect(person.credits.cast).toHaveLength(2);
		expect(person.credits.cast[0]).toMatchObject({
			creditId: "cc1",
			character: "The Narrator",
			mediaType: "movie",
		});
		expect(person.credits.crew[0]).toMatchObject({
			creditId: "cj1",
			job: "Producer",
		});
		expect(person.birthday).toBe("1969-08-18");
		expect(person.deathday).toBeNull();
	});
});
