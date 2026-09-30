import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { MediaType, TimeWindow } from "#/schemas/common.ts";
import { DiscoverSearch } from "#/schemas/discover.ts";

import { TmdbNotFoundError } from "../errors";
import {
	discover,
	genres,
	list,
	movieDetails,
	providers,
	season,
	trending,
	tvDetails,
} from "../tmdb/endpoints";

const pageSchema = z.number().int().min(1).max(500).default(1);
const idSchema = z.number().int().positive();

// TMDB 404s become route-level not-found panels.
const orNotFound = async <T>(load: () => Promise<T>): Promise<T> => {
	try {
		return await load();
	} catch (error) {
		if (error instanceof TmdbNotFoundError) {
			throw notFound();
		}
		throw error;
	}
};

export const getTrending = createServerFn({ method: "GET" })
	.validator(
		z.object({
			type: z.enum(["all", "movie", "tv"]),
			window: TimeWindow,
			page: pageSchema,
		})
	)
	.handler(({ data }) => trending(data.type, data.window, data.page));

export const getList = createServerFn({ method: "GET" })
	.validator(
		z.object({
			type: MediaType,
			// Membership is enforced by ListCategory inside list().
			category: z.string().min(1),
			page: pageSchema,
		})
	)
	.handler(({ data }) => list(data.type, data.category, data.page));

export const getMovieDetails = createServerFn({ method: "GET" })
	.validator(z.object({ id: idSchema }))
	.handler(({ data }) => orNotFound(() => movieDetails(data.id)));

export const getTvDetails = createServerFn({ method: "GET" })
	.validator(z.object({ id: idSchema }))
	.handler(({ data }) => orNotFound(() => tvDetails(data.id)));

export const getSeason = createServerFn({ method: "GET" })
	.validator(
		z.object({ id: idSchema, seasonNumber: z.number().int().min(0).max(200) })
	)
	.handler(({ data }) => orNotFound(() => season(data.id, data.seasonNumber)));

export const getDiscover = createServerFn({ method: "GET" })
	.validator(z.object({ type: MediaType, filters: DiscoverSearch }))
	.handler(({ data }) => discover(data.type, data.filters));

export const getGenres = createServerFn({ method: "GET" })
	.validator(z.object({ type: MediaType }))
	.handler(({ data }) => genres(data.type));

export const getProviders = createServerFn({ method: "GET" })
	.validator(z.object({ type: MediaType, region: z.string().length(2) }))
	.handler(({ data }) => providers(data.type, data.region));
