import type { MediaType } from "#/schemas/common.ts";
import type { DiscoverSearch } from "#/schemas/discover.ts";

export const tmdbKeys = {
	all: ["tmdb"] as const,
	trending: (type: string, window: string, page: number) =>
		[...tmdbKeys.all, "trending", type, window, page] as const,
	list: (t: MediaType, category: string, page: number) =>
		[...tmdbKeys.all, "list", t, category, page] as const,
	discover: (t: MediaType, filters: DiscoverSearch) =>
		[...tmdbKeys.all, "discover", t, filters] as const,
	search: (type: string, query: string, page: number) =>
		[...tmdbKeys.all, "search", type, query, page] as const,
	movie: (id: number) => [...tmdbKeys.all, "movie", id] as const,
	tv: (id: number) => [...tmdbKeys.all, "tv", id] as const,
	season: (id: number, seasonNumber: number) =>
		[...tmdbKeys.tv(id), "season", seasonNumber] as const,
	person: (id: number) => [...tmdbKeys.all, "person", id] as const,
	genres: (t: MediaType) => [...tmdbKeys.all, "genres", t] as const,
	providers: (t: MediaType, region: string) =>
		[...tmdbKeys.all, "providers", t, region] as const,
};
