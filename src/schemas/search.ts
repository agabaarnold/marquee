import { z } from "zod";

import type { MediaSummary, SearchResult } from "#/types/media";

import { imagePath } from "./common";
import { MovieSummaryRaw, toMovieSummary } from "./movie";
import { TvSummaryRaw, toTvSummary } from "./tv";

const MovieBranch = MovieSummaryRaw.extend({
	media_type: z.literal("movie"),
});
const TvBranch = TvSummaryRaw.extend({ media_type: z.literal("tv") });

// Mixed movie/tv rows (trending/all, discover blind spots). Person rows are
// dropped by pagedLenient at the page level instead of failing the parse.
export const MediaFromAny = z
	.discriminatedUnion("media_type", [MovieBranch, TvBranch])
	.transform((r): MediaSummary =>
		r.media_type === "movie" ? toMovieSummary(r) : toTvSummary(r)
	);

const PersonBranch = z.object({
	media_type: z.literal("person"),
	id: z.number(),
	name: z.string().default(""),
	profile_path: imagePath,
	known_for_department: z
		.string()
		.nullish()
		.transform((v) => v ?? null),
});

export const PersonResultSchema = PersonBranch.transform((p): SearchResult => ({
	kind: "person",
	id: p.id,
	name: p.name,
	profilePath: p.profile_path,
	knownFor: p.known_for_department,
}));

// search/multi rows: media entries carry kind "media", people kind "person".
export const SearchResultSchema = z
	.discriminatedUnion("media_type", [MovieBranch, TvBranch, PersonBranch])
	.transform((r): SearchResult => {
		if (r.media_type === "person") {
			return {
				kind: "person",
				id: r.id,
				name: r.name,
				profilePath: r.profile_path,
				knownFor: r.known_for_department,
			};
		}
		return r.media_type === "movie"
			? { ...toMovieSummary(r), kind: "media" }
			: { ...toTvSummary(r), kind: "media" };
	});
