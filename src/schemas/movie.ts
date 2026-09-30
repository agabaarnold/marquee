import { z } from "zod";

import type { MediaSummary, MovieDetails } from "#/types/media";

import {
	CastRaw,
	CrewRaw,
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

export const MovieSummaryRaw = z.object({
	id: z.number(),
	title: z.string(),
	original_title: z.string().default(""),
	overview: z.string().default(""),
	poster_path: imagePath,
	backdrop_path: imagePath,
	release_date: dateStr,
	vote_average: z.number().default(0),
	vote_count: z.number().default(0),
	popularity: z.number().default(0),
	genre_ids: z.array(z.number()).default([]),
	original_language: z.string().default("en"),
});

export type MovieSummaryRawData = z.infer<typeof MovieSummaryRaw>;

export const toMovieSummary = (m: MovieSummaryRawData): MediaSummary => ({
	mediaType: "movie",
	id: m.id,
	title: m.title,
	originalTitle: m.original_title,
	overview: m.overview,
	posterPath: m.poster_path,
	backdropPath: m.backdrop_path,
	date: m.release_date,
	year: yearOf(m.release_date),
	rating: m.vote_average,
	voteCount: m.vote_count,
	popularity: m.popularity,
	genreIds: m.genre_ids,
	originalLanguage: m.original_language,
});

export const MovieSummarySchema = MovieSummaryRaw.transform(toMovieSummary);

// Validates append_to_response=credits,videos,images,recommendations,similar,release_dates,watch/providers,keywords,external_ids.
export const MovieDetailsRaw = MovieSummaryRaw.extend({
	id: z.number(),
	title: z.string(),
	tagline: z.string().nullish(),
	overview: z.string().default(""),
	runtime: z.number().nullish(),
	status: z.string(),
	homepage: z.string().nullish(),
	budget: z.number().default(0),
	revenue: z.number().default(0),
	genres: z.array(Genre),
	belongs_to_collection: z
		.object({ id: z.number(), name: z.string(), poster_path: imagePath })
		.nullish(),
	production_companies: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			logo_path: imagePath,
			origin_country: z.string().default(""),
		})
	),
	credits: z.object({
		cast: lenientArray(CastRaw),
		crew: lenientArray(CrewRaw),
	}),
	videos: z.object({ results: lenientArray(VideoRaw) }),
	images: ImagesRaw,
	recommendations: paged(MovieSummarySchema),
	similar: paged(MovieSummarySchema),
	release_dates: z.object({
		results: z.array(
			z.object({
				iso_3166_1: z.string(),
				release_dates: z.array(
					z.object({ certification: z.string(), type: z.number() })
				),
			})
		),
	}),
	"watch/providers": z.object({
		results: z.record(z.string(), ProvidersRaw),
	}),
	keywords: z.object({
		keywords: z.array(z.object({ id: z.number(), name: z.string() })),
	}),
	external_ids: ExternalIdsRaw,
});

// Prefer the US theatrical certification, fall back to any rated entry.
const certificationFromReleases = (
	releases: z.infer<typeof MovieDetailsRaw>["release_dates"]
): string | null => {
	const rated = releases.results.filter((r) =>
		r.release_dates.some((d) => d.certification !== "")
	);
	const region =
		rated.find((r) => r.iso_3166_1 === "US") ?? rated.at(0) ?? null;
	if (!region) {
		return null;
	}
	const theatrical =
		region.release_dates.find((d) => d.certification !== "" && d.type === 3) ??
		region.release_dates.find((d) => d.certification !== "");
	return theatrical?.certification ?? null;
};

export const MovieDetailsSchema = MovieDetailsRaw.transform(
	(m): MovieDetails => ({
		mediaType: "movie",
		id: m.id,
		title: m.title,
		originalTitle: m.original_title,
		overview: m.overview,
		posterPath: m.poster_path,
		backdropPath: m.backdrop_path,
		date: m.release_date,
		year: yearOf(m.release_date),
		rating: m.vote_average,
		voteCount: m.vote_count,
		popularity: m.popularity,
		genreIds: m.genre_ids,
		originalLanguage: m.original_language,
		tagline: m.tagline ?? null,
		status: m.status,
		homepage: m.homepage || null,
		genres: m.genres,
		certification: certificationFromReleases(m.release_dates),
		cast: m.credits.cast,
		crew: m.credits.crew,
		videos: m.videos.results,
		images: {
			backdrops: m.images.backdrops,
			posters: m.images.posters,
			logos: m.images.logos,
		},
		recommendations: m.recommendations.results,
		similar: m.similar.results,
		keywords: m.keywords.keywords,
		providers: m["watch/providers"].results,
		externalIds: m.external_ids,
		runtimeMinutes: m.runtime ?? null,
		budget: m.budget,
		revenue: m.revenue,
		collection: m.belongs_to_collection
			? {
					id: m.belongs_to_collection.id,
					name: m.belongs_to_collection.name,
					posterPath: m.belongs_to_collection.poster_path,
				}
			: null,
		directors: m.credits.crew.filter((c) => c.job === "Director"),
		productionCompanies: m.production_companies.map((c) => ({
			id: c.id,
			name: c.name,
			logoPath: c.logo_path,
			country: c.origin_country,
		})),
	})
);

export type MovieDetailsData = z.infer<typeof MovieDetailsSchema>;
