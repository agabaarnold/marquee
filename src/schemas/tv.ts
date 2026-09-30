import { z } from "zod";

import type {
	CastMember,
	CrewMember,
	EpisodeSummary,
	MediaSummary,
	SeasonDetails,
	SeasonSummary,
	TvDetails,
} from "#/types/media";

import {
	ExternalIdsRaw,
	Genre,
	ImagesRaw,
	ProvidersRaw,
	VideoRaw,
	dateStr,
	imagePath,
	lenientArray,
	paged,
	yearOf,
} from "./common";

export const TvSummaryRaw = z.object({
	id: z.number(),
	name: z.string(),
	original_name: z.string().default(""),
	overview: z.string().default(""),
	poster_path: imagePath,
	backdrop_path: imagePath,
	first_air_date: dateStr,
	vote_average: z.number().default(0),
	vote_count: z.number().default(0),
	popularity: z.number().default(0),
	genre_ids: z.array(z.number()).default([]),
	original_language: z.string().default("en"),
});

export type TvSummaryRawData = z.infer<typeof TvSummaryRaw>;

export const toTvSummary = (t: TvSummaryRawData): MediaSummary => ({
	mediaType: "tv",
	id: t.id,
	title: t.name,
	originalTitle: t.original_name,
	overview: t.overview,
	posterPath: t.poster_path,
	backdropPath: t.backdrop_path,
	date: t.first_air_date,
	year: yearOf(t.first_air_date),
	rating: t.vote_average,
	voteCount: t.vote_count,
	popularity: t.popularity,
	genreIds: t.genre_ids,
	originalLanguage: t.original_language,
});

export const TvSummarySchema = TvSummaryRaw.transform(toTvSummary);

// aggregate_credits gives roles[]/jobs[] per person instead of a flat character/job.
const AggregateCastRaw = z
	.object({
		id: z.number(),
		name: z.string(),
		profile_path: imagePath,
		order: z.number().default(0),
		roles: z
			.array(
				z.object({
					credit_id: z.string(),
					character: z.string().nullish(),
					episode_count: z.number().default(0),
				})
			)
			.default([]),
	})
	.transform((c): CastMember => ({
		id: c.id,
		name: c.name,
		character: c.roles.at(0)?.character || null,
		profilePath: c.profile_path,
		order: c.order,
	}));

const AggregateCrewRaw = z
	.object({
		id: z.number(),
		name: z.string(),
		profile_path: imagePath,
		department: z.string().default(""),
		jobs: z
			.array(
				z.object({
					credit_id: z.string(),
					job: z.string().default(""),
					episode_count: z.number().default(0),
				})
			)
			.default([]),
	})
	.transform((c): CrewMember => ({
		id: c.id,
		name: c.name,
		job: c.jobs.at(0)?.job || "",
		department: c.department,
		profilePath: c.profile_path,
	}));

export const EpisodeRaw = z
	.object({
		id: z.number(),
		season_number: z.number(),
		episode_number: z.number(),
		name: z.string().default(""),
		overview: z.string().default(""),
		air_date: dateStr,
		runtime: z.number().nullish(),
		still_path: imagePath,
		vote_average: z.number().default(0),
		vote_count: z.number().default(0),
	})
	.transform((e): EpisodeSummary => ({
		id: e.id,
		seasonNumber: e.season_number,
		episodeNumber: e.episode_number,
		name: e.name,
		overview: e.overview,
		airDate: e.air_date,
		runtimeMinutes: e.runtime ?? null,
		stillPath: e.still_path,
		rating: e.vote_average,
		voteCount: e.vote_count,
	}));

const seasonSummaryRaw = z.object({
	id: z.number(),
	season_number: z.number(),
	name: z.string().default(""),
	overview: z.string().default(""),
	air_date: dateStr,
	episode_count: z.number().default(0),
	poster_path: imagePath,
	vote_average: z.number().default(0),
});

export const SeasonSummarySchema = seasonSummaryRaw.transform(
	(s): SeasonSummary => ({
		id: s.id,
		seasonNumber: s.season_number,
		name: s.name,
		overview: s.overview,
		airDate: s.air_date,
		episodeCount: s.episode_count,
		posterPath: s.poster_path,
		rating: s.vote_average,
	})
);

// TMDB season details carry no show id; callers attach it to get SeasonDetails.
export const SeasonDetailsRaw = seasonSummaryRaw.extend({
	episodes: lenientArray(EpisodeRaw).default([]),
});

export type SeasonDetailsRawData = z.infer<typeof SeasonDetailsRaw>;

export const toSeasonDetails = (
	raw: SeasonDetailsRawData,
	showId: number
): SeasonDetails => ({
	id: raw.id,
	seasonNumber: raw.season_number,
	name: raw.name,
	overview: raw.overview,
	airDate: raw.air_date,
	episodeCount: raw.episode_count,
	posterPath: raw.poster_path,
	rating: raw.vote_average,
	episodes: raw.episodes,
	showId,
});

const CreatorRaw = z.object({
	id: z.number(),
	name: z.string(),
	profile_path: imagePath,
});

const NetworkRaw = z.object({
	id: z.number(),
	name: z.string(),
	logo_path: imagePath,
});

const nullableEpisode = EpisodeRaw.nullish().transform((v) => v ?? null);

// Mirrors MovieDetailsRaw with aggregate_credits, content_ratings,
// keywords.results, seasons, networks, created_by, episode/country fields.
// Validates append_to_response=aggregate_credits,videos,images,recommendations,similar,content_ratings,watch/providers,keywords,external_ids.
export const TvDetailsRaw = TvSummaryRaw.extend({
	tagline: z.string().nullish(),
	status: z.string(),
	homepage: z.string().nullish(),
	genres: z.array(Genre),
	created_by: z.array(CreatorRaw),
	networks: z.array(NetworkRaw),
	seasons: lenientArray(SeasonSummarySchema),
	number_of_seasons: z.number().default(0),
	number_of_episodes: z.number().default(0),
	episode_run_time: z.array(z.number()).default([]),
	in_production: z.boolean().default(false),
	type: z.string().default(""),
	aggregate_credits: z.object({
		cast: lenientArray(AggregateCastRaw),
		crew: lenientArray(AggregateCrewRaw),
	}),
	videos: z.object({ results: lenientArray(VideoRaw) }),
	images: ImagesRaw,
	recommendations: paged(TvSummarySchema),
	similar: paged(TvSummarySchema),
	content_ratings: z.object({
		results: z.array(
			z.object({
				iso_3166_1: z.string(),
				rating: z.string(),
			})
		),
	}),
	"watch/providers": z.object({
		results: z.record(z.string(), ProvidersRaw),
	}),
	keywords: z.object({
		results: z.array(z.object({ id: z.number(), name: z.string() })),
	}),
	external_ids: ExternalIdsRaw,
	last_episode_to_air: nullableEpisode,
	next_episode_to_air: nullableEpisode,
});

// Prefer the US content rating, fall back to any rated entry.
const certificationFromContentRatings = (
	ratings: z.infer<typeof TvDetailsRaw>["content_ratings"]
): string | null => {
	const rated = ratings.results.filter((r) => r.rating !== "");
	const region =
		rated.find((r) => r.iso_3166_1 === "US") ?? rated.at(0) ?? null;
	return region?.rating ?? null;
};

export const TvDetailsSchema = TvDetailsRaw.transform((t): TvDetails => ({
	mediaType: "tv",
	id: t.id,
	title: t.name,
	originalTitle: t.original_name,
	overview: t.overview,
	posterPath: t.poster_path,
	backdropPath: t.backdrop_path,
	date: t.first_air_date,
	year: yearOf(t.first_air_date),
	rating: t.vote_average,
	voteCount: t.vote_count,
	popularity: t.popularity,
	genreIds: t.genre_ids,
	originalLanguage: t.original_language,
	tagline: t.tagline ?? null,
	status: t.status,
	homepage: t.homepage || null,
	genres: t.genres,
	certification: certificationFromContentRatings(t.content_ratings),
	cast: t.aggregate_credits.cast,
	crew: t.aggregate_credits.crew,
	videos: t.videos.results,
	images: {
		backdrops: t.images.backdrops,
		posters: t.images.posters,
		logos: t.images.logos,
	},
	recommendations: t.recommendations.results,
	similar: t.similar.results,
	keywords: t.keywords.results,
	providers: t["watch/providers"].results,
	externalIds: t.external_ids,
	seasons: t.seasons,
	numberOfSeasons: t.number_of_seasons,
	numberOfEpisodes: t.number_of_episodes,
	episodeRuntimeMinutes: t.episode_run_time.at(0) ?? null,
	inProduction: t.in_production,
	seriesType: t.type,
	creators: t.created_by.map((c) => ({
		id: c.id,
		name: c.name,
		profilePath: c.profile_path,
	})),
	networks: t.networks.map((n) => ({
		id: n.id,
		name: n.name,
		logoPath: n.logo_path,
	})),
	lastEpisodeToAir: t.last_episode_to_air,
	nextEpisodeToAir: t.next_episode_to_air,
}));

export type TvDetailsData = z.infer<typeof TvDetailsSchema>;
