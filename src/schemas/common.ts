import { z } from "zod";

import type {
	CastMember,
	CrewMember,
	ImageRef,
	Video,
	WatchProvider,
	WatchProviders,
} from "#/types/media";

// oxlint-disable-next-line no-redeclare -- Zod idiom: the schema value and its inferred type share a name.
export const MediaType = z.enum(["movie", "tv"]);
export type MediaType = z.infer<typeof MediaType>;

// oxlint-disable-next-line no-redeclare -- Zod idiom: the schema value and its inferred type share a name.
export const TimeWindow = z.enum(["day", "week"]);
export type TimeWindow = z.infer<typeof TimeWindow>;

// TMDB image paths arrive as "/abc.jpg" or null.
const path = z
	.string()
	.nullish()
	.transform((v) => v ?? null);
// TMDB sometimes returns "" for unknown dates; normalize to null.
const dateStr = z
	.string()
	.nullish()
	.transform((v) => v || null);

// oxlint-disable-next-line no-redeclare -- Zod idiom: the schema value and its inferred type share a name.
export const Genre = z.object({ id: z.number(), name: z.string() });
export type Genre = z.infer<typeof Genre>;

export const yearOf = (d: string | null): number | null => {
	if (!d) {
		return null;
	}
	return Number(d.slice(0, 4)) || null;
};

/** Drop malformed rows instead of failing the whole page. */
export const lenientArray = <T extends z.ZodType>(item: T) =>
	z.array(z.unknown()).transform((rows) =>
		rows.flatMap((r) => {
			const p = item.safeParse(r);
			return p.success ? [p.data] : [];
		})
	);

export const paged = <T extends z.ZodType>(item: T) =>
	z
		.object({
			page: z.number(),
			results: z.array(item),
			total_pages: z.number(),
			total_results: z.number(),
		})
		.transform((p) => ({
			page: p.page,
			results: p.results,
			// TMDB caps pagination at 500 pages.
			totalPages: Math.min(p.total_pages, 500),
			totalResults: p.total_results,
		}));
export interface Paged<T> {
	page: number;
	results: T[];
	totalPages: number;
	totalResults: number;
}

// Same as paged, but drops malformed rows (e.g. person entries in trending/all)
// instead of failing the whole page.
export const pagedLenient = <T extends z.ZodType>(item: T) =>
	z
		.object({
			page: z.number(),
			results: lenientArray(item),
			total_pages: z.number(),
			total_results: z.number(),
		})
		.transform((p) => ({
			page: p.page,
			results: p.results,
			// TMDB caps pagination at 500 pages.
			totalPages: Math.min(p.total_pages, 500),
			totalResults: p.total_results,
		}));

export const CastRaw = z
	.object({
		id: z.number(),
		name: z.string(),
		character: z
			.string()
			.nullish()
			.transform((v) => v || null),
		profile_path: path,
		order: z.number().default(0),
	})
	.transform((c): CastMember => ({
		id: c.id,
		name: c.name,
		character: c.character,
		profilePath: c.profile_path,
		order: c.order,
	}));

export const CrewRaw = z
	.object({
		id: z.number(),
		name: z.string(),
		job: z.string().default(""),
		department: z.string().default(""),
		profile_path: path,
	})
	.transform((c): CrewMember => ({
		id: c.id,
		name: c.name,
		job: c.job,
		department: c.department,
		profilePath: c.profile_path,
	}));

export const VideoRaw = z
	.object({
		id: z.string(),
		key: z.string(),
		site: z.string().default(""),
		type: z.string().default(""),
		name: z.string().default(""),
		official: z.boolean().default(false),
		published_at: dateStr,
	})
	.transform((v): Video => ({
		id: v.id,
		key: v.key,
		site: v.site,
		type: v.type,
		name: v.name,
		official: v.official,
		publishedAt: v.published_at,
	}));

export const ImageRaw = z
	.object({
		file_path: z.string(),
		width: z.number().default(0),
		height: z.number().default(0),
		aspect_ratio: z.number().default(0),
		vote_average: z.number().default(0),
	})
	.transform((i): ImageRef => ({
		filePath: i.file_path,
		width: i.width,
		height: i.height,
		aspectRatio: i.aspect_ratio,
		voteAverage: i.vote_average,
	}));

export const ImagesRaw = z.object({
	backdrops: lenientArray(ImageRaw).default([]),
	posters: lenientArray(ImageRaw).default([]),
	logos: lenientArray(ImageRaw).default([]),
});

const WatchProviderItemRaw = z.object({
	provider_id: z.number(),
	provider_name: z.string(),
	logo_path: path,
	display_priority: z.number().default(0),
});

export const WatchProviderRaw = WatchProviderItemRaw.transform(
	(p): WatchProvider => ({
		id: p.provider_id,
		name: p.provider_name,
		logoPath: p.logo_path,
		priority: p.display_priority,
	})
);

export const ProvidersRaw = z
	.object({
		link: z
			.string()
			.nullish()
			.transform((v) => v ?? null),
		flatrate: lenientArray(WatchProviderRaw).default([]),
		rent: lenientArray(WatchProviderRaw).default([]),
		buy: lenientArray(WatchProviderRaw).default([]),
		free: lenientArray(WatchProviderRaw).default([]),
	})
	.transform((w): WatchProviders => ({
		link: w.link,
		flatrate: w.flatrate,
		rent: w.rent,
		buy: w.buy,
		free: w.free,
	}));

// Flat provider list from watch/providers/{movie|tv} (extra keys are stripped).
export const WatchProvidersListRaw = z.object({
	results: lenientArray(WatchProviderRaw),
});

export const ExternalIdsRaw = z
	.object({
		imdb_id: z
			.string()
			.nullish()
			.transform((v) => v ?? null),
		instagram_id: z
			.string()
			.nullish()
			.transform((v) => v ?? null),
		// TMDB still names this field twitter_id.
		twitter_id: z
			.string()
			.nullish()
			.transform((v) => v ?? null),
		facebook_id: z
			.string()
			.nullish()
			.transform((v) => v ?? null),
	})
	.transform((e) => ({
		imdb: e.imdb_id,
		instagram: e.instagram_id,
		x: e.twitter_id,
		facebook: e.facebook_id,
	}));

export { path as imagePath, dateStr };
