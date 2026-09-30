import { queryOptions } from "@tanstack/react-query";

import { getPerson } from "#/server/functions/person.ts";

import { tmdbKeys } from "./keys";

const MINUTE = 60_000;

export const personQuery = (id: number) =>
	queryOptions({
		queryKey: tmdbKeys.person(id),
		queryFn: () => getPerson({ data: { id } }),
		staleTime: 30 * MINUTE,
	});
