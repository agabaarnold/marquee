import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { MediaType, TimeWindow } from "#/schemas/common.ts";
import type { DiscoverSearch } from "#/schemas/discover.ts";
import {
	getDiscover,
	getGenres,
	getList,
	getMovieDetails,
	getProviders,
	getSeason,
	getTrending,
	getTvDetails,
} from "#/server/functions/media.ts";

import { tmdbKeys } from "./keys";

const MINUTE = 60_000;

export const trendingQuery = (
	type: "all" | "movie" | "tv",
	window: TimeWindow,
	page = 1
) =>
	queryOptions({
		queryKey: tmdbKeys.trending(type, window, page),
		queryFn: () => getTrending({ data: { type, window, page } }),
		staleTime: 10 * MINUTE,
	});

export const listQuery = (t: MediaType, category: string, page = 1) =>
	queryOptions({
		queryKey: tmdbKeys.list(t, category, page),
		queryFn: () => getList({ data: { type: t, category, page } }),
		staleTime: 10 * MINUTE,
	});

export const movieQuery = (id: number) =>
	queryOptions({
		queryKey: tmdbKeys.movie(id),
		queryFn: () => getMovieDetails({ data: { id } }),
		staleTime: 30 * MINUTE,
	});

export const tvQuery = (id: number) =>
	queryOptions({
		queryKey: tmdbKeys.tv(id),
		queryFn: () => getTvDetails({ data: { id } }),
		staleTime: 30 * MINUTE,
	});

export const seasonQuery = (id: number, seasonNumber: number) =>
	queryOptions({
		queryKey: tmdbKeys.season(id, seasonNumber),
		queryFn: () => getSeason({ data: { id, seasonNumber } }),
		staleTime: 30 * MINUTE,
	});

export const discoverQuery = (t: MediaType, filters: DiscoverSearch) =>
	queryOptions({
		queryKey: tmdbKeys.discover(t, filters),
		queryFn: () => getDiscover({ data: { type: t, filters } }),
		staleTime: 5 * MINUTE,
		placeholderData: keepPreviousData,
	});

export const genresQuery = (t: MediaType) =>
	queryOptions({
		queryKey: tmdbKeys.genres(t),
		queryFn: () => getGenres({ data: { type: t } }),
		staleTime: Infinity,
	});

export const providersQuery = (t: MediaType, region: string) =>
	queryOptions({
		queryKey: tmdbKeys.providers(t, region),
		queryFn: () => getProviders({ data: { type: t, region } }),
		staleTime: Infinity,
	});
