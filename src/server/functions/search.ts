import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { search } from "../tmdb/endpoints";

export type SearchQueryType = "multi" | "movie" | "tv" | "person";

// Trimmed, single-spaced, capped: matches the /search URL contract.
const querySchema = z
	.string()
	.trim()
	.min(1)
	.max(100)
	.transform((q) => q.replaceAll(/\s+/gu, " "));

export const searchMedia = createServerFn({ method: "GET" })
	.validator(
		z.object({
			query: querySchema,
			type: z.enum(["multi", "movie", "tv", "person"]),
			page: z.number().int().min(1).max(500).default(1),
		})
	)
	.handler(({ data }) => search(data.query, data.type, data.page));
