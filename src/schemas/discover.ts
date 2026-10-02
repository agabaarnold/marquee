import { z } from "zod";

import type { TmdbGetOptions } from "#/server/tmdb/http.ts";

import { MediaType } from "./common";

// oxlint-disable-next-line no-redeclare -- Zod idiom: the schema value and its inferred type share a name.
export const DiscoverSearch = z.object({
	type: MediaType.default("movie"),
	// Serialised as ?genres=28&genres=12 (or "28,12" via custom codec).
	genres: z.array(z.number()).default([]),
	yearFrom: z.number().int().min(1888).optional(),
	yearTo: z
		.number()
		.int()
		.max(new Date().getFullYear() + 5)
		.optional(),
	minRating: z.number().min(0).max(10).default(0),
	sort: z
		.enum([
			"popularity.desc",
			"vote_average.desc",
			"primary_release_date.desc",
			"revenue.desc",
		])
		.default("popularity.desc"),
	providers: z.array(z.number()).default([]),
	region: z.string().length(2).optional(),
	page: z.number().int().min(1).max(500).default(1),
});
export type DiscoverSearch = z.infer<typeof DiscoverSearch>;

export const ListCategory = {
	movie: z.enum(["popular", "top_rated", "now_playing", "upcoming"]),
	tv: z.enum(["popular", "top_rated", "airing_today", "on_the_air"]),
} as const;

export const SearchPageSearch = z.object({
	q: z.string().trim().default(""),
	type: z.enum(["all", "movie", "tv", "person"]).default("all"),
	page: z.number().int().min(1).max(500).default(1),
});

// Params: "550-fight-club" → 550.
export const IdSlugParam = z
	.string()
	.regex(/^(?<id>\d+)(?<slug>-[a-z0-9-]*)?$/iu)
	.transform((s) => {
		const dash = s.indexOf("-");
		if (dash === -1) {
			return { id: Number(s), slug: "" };
		}
		return { id: Number(s.slice(0, dash)), slug: s.slice(dash + 1) };
	});
export const SeasonParam = z.coerce.number().int().min(0).max(200).default(1);

type DiscoverParams = NonNullable<TmdbGetOptions["params"]>;

type DiscoverSort = DiscoverSearch["sort"];

// revenue sorting is movie-only; remap tv-incompatible values.
const tvSort = (sort: DiscoverSort): string => {
	if (sort === "revenue.desc") {
		return "popularity.desc";
	}
	return sort.replace("primary_release_date", "first_air_date");
};

// Map typed filter state to TMDB discover names, handling the movie/TV
// differences (date keys, tv-incompatible sort values, provider region).
export const toDiscoverParams = (
	t: MediaType,
	s: DiscoverSearch
): DiscoverParams => {
	const dateKey = t === "movie" ? "primary_release_date" : "first_air_date";
	const params: DiscoverParams = {
		page: s.page,
		include_adult: false,
		sort_by: t === "tv" ? tvSort(s.sort) : s.sort,
	};
	if (s.genres.length > 0) {
		params.with_genres = s.genres.join(",");
	}
	if (s.yearFrom !== undefined) {
		params[`${dateKey}.gte`] = `${s.yearFrom}-01-01`;
	}
	if (s.yearTo !== undefined) {
		params[`${dateKey}.lte`] = `${s.yearTo}-12-31`;
	}
	if (s.minRating > 0) {
		params["vote_average.gte"] = s.minRating;
		// Avoid 10/10 titles with a single vote.
		params["vote_count.gte"] = 50;
	}
	if (s.providers.length > 0) {
		params.with_watch_providers = s.providers.join(",");
		// TMDB requires a region when filtering by providers.
		params.watch_region = s.region ?? "US";
	} else if (s.region !== undefined) {
		params.watch_region = s.region;
	}
	return params;
};
