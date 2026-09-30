import { z } from "zod";

import {
	Genre,
	WatchProvidersListRaw,
	paged,
	pagedLenient,
} from "#/schemas/common.ts";
import type { MediaType, TimeWindow } from "#/schemas/common.ts";
import { ListCategory, toDiscoverParams } from "#/schemas/discover.ts";
import type { DiscoverSearch } from "#/schemas/discover.ts";
import { MovieDetailsSchema, MovieSummarySchema } from "#/schemas/movie.ts";
import { PersonSchema } from "#/schemas/person.ts";
import {
	MediaFromAny,
	PersonResultSchema,
	SearchResultSchema,
} from "#/schemas/search.ts";
import {
	SeasonDetailsRaw,
	TvDetailsSchema,
	TvSummarySchema,
	toSeasonDetails,
} from "#/schemas/tv.ts";

import { tmdbGet } from "./http";

export type TrendingType = "all" | "movie" | "tv";
export type SearchType = "multi" | "movie" | "tv" | "person";

interface RequestOptions {
	signal?: AbortSignal;
}

const IMAGE_LANGUAGE = "en,null";

export const trending = (
	type: TrendingType,
	window: TimeWindow,
	page = 1,
	opts: RequestOptions = {}
) =>
	tmdbGet(`/trending/${type}/${window}`, pagedLenient(MediaFromAny), {
		params: { page },
		signal: opts.signal,
	});

export const list = (
	t: MediaType,
	category: string,
	page = 1,
	opts: RequestOptions = {}
) => {
	// Validate before interpolating into the path.
	const parsed = ListCategory[t].parse(category);
	return tmdbGet(
		`/${t}/${parsed}`,
		paged(t === "movie" ? MovieSummarySchema : TvSummarySchema),
		{ params: { page }, signal: opts.signal }
	);
};

export const movieDetails = (id: number, opts: RequestOptions = {}) =>
	tmdbGet(`/movie/${id}`, MovieDetailsSchema, {
		params: {
			append_to_response:
				"credits,videos,images,recommendations,similar,release_dates,watch/providers,keywords,external_ids",
			include_image_language: IMAGE_LANGUAGE,
		},
		signal: opts.signal,
	});

export const tvDetails = (id: number, opts: RequestOptions = {}) =>
	tmdbGet(`/tv/${id}`, TvDetailsSchema, {
		params: {
			append_to_response:
				"aggregate_credits,videos,images,recommendations,similar,content_ratings,watch/providers,keywords,external_ids",
			include_image_language: IMAGE_LANGUAGE,
		},
		signal: opts.signal,
	});

// TMDB season details carry no show id, so it is attached after parsing.
export const season = async (
	id: number,
	n: number,
	opts: RequestOptions = {}
) => {
	const raw = await tmdbGet(`/tv/${id}/season/${n}`, SeasonDetailsRaw, {
		signal: opts.signal,
	});
	return toSeasonDetails(raw, id);
};

export const person = (id: number, opts: RequestOptions = {}) =>
	tmdbGet(`/person/${id}`, PersonSchema, {
		params: { append_to_response: "combined_credits,external_ids" },
		signal: opts.signal,
	});

export const search = (
	q: string,
	type: SearchType,
	page = 1,
	opts: RequestOptions = {}
) => {
	// Only multi responses carry media_type, so each type gets its own schema.
	const params = { query: q, page, include_adult: false };
	const options = { params, signal: opts.signal };
	switch (type) {
		case "movie": {
			return tmdbGet("/search/movie", paged(MovieSummarySchema), options);
		}
		case "tv": {
			return tmdbGet("/search/tv", paged(TvSummarySchema), options);
		}
		case "person": {
			return tmdbGet("/search/person", paged(PersonResultSchema), options);
		}
		default: {
			return tmdbGet("/search/multi", paged(SearchResultSchema), options);
		}
	}
};

export const discover = (
	t: MediaType,
	s: DiscoverSearch,
	opts: RequestOptions = {}
) =>
	tmdbGet(
		`/discover/${t}`,
		t === "movie" ? paged(MovieSummarySchema) : paged(TvSummarySchema),
		{ params: toDiscoverParams(t, s), signal: opts.signal }
	);

export const genres = (t: MediaType, opts: RequestOptions = {}) =>
	tmdbGet(
		`/genre/${t}/list`,
		z.object({ genres: z.array(Genre) }).transform((v) => v.genres),
		{ signal: opts.signal }
	);

export const providers = (
	t: MediaType,
	region: string,
	opts: RequestOptions = {}
) =>
	tmdbGet(`/watch/providers/${t}`, WatchProvidersListRaw, {
		params: { watch_region: region },
		signal: opts.signal,
	});
