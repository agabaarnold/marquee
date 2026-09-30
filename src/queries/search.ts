import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { searchMedia } from "#/server/functions/search.ts";
import type { SearchQueryType } from "#/server/functions/search.ts";

import { tmdbKeys } from "./keys";

const MINUTE = 60_000;

// The command palette adds enabled: query.trim().length >= 2 at the call
// site; the /search page guards on its validated q instead, so the shared
// options stay suspense-compatible.
export const searchQuery = (type: SearchQueryType, query: string, page = 1) =>
	queryOptions({
		queryKey: tmdbKeys.search(type, query, page),
		queryFn: () => searchMedia({ data: { query, type, page } }),
		staleTime: 2 * MINUTE,
		placeholderData: keepPreviousData,
	});
