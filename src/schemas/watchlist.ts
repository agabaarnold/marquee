import { z } from "zod";

import { MediaType } from "./common";

// oxlint-disable-next-line no-redeclare -- Zod idiom: the schema value and its inferred type share a name.
export const WatchlistItem = z.object({
	mediaType: MediaType,
	id: z.number(),
	title: z.string(),
	posterPath: z.string().nullable(),
	year: z.number().nullable(),
	addedAt: z.iso.datetime(),
	status: z.enum(["planned", "watching", "watched"]).default("planned"),
});
export type WatchlistItem = z.infer<typeof WatchlistItem>;

// oxlint-disable-next-line no-redeclare -- Zod idiom: the schema value and its inferred type share a name.
export const WatchlistState = z.object({
	version: z.literal(1),
	items: z.array(WatchlistItem),
});
export type WatchlistState = z.infer<typeof WatchlistState>;
