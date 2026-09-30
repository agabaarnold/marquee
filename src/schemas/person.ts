import { z } from "zod";

import type { PersonCredit, PersonDetails } from "#/types/media";

import { ExternalIdsRaw, dateStr, imagePath, lenientArray } from "./common";
import { MovieSummaryRaw, toMovieSummary } from "./movie";
import { TvSummaryRaw, toTvSummary } from "./tv";

const nullableText = z
	.string()
	.nullish()
	.transform((v) => v ?? null);

// combined_credits items carry the summary shape plus a role/job and credit id.
const PersonCastRaw = z
	.discriminatedUnion("media_type", [
		MovieSummaryRaw.extend({
			media_type: z.literal("movie"),
			character: nullableText,
			credit_id: z.string(),
		}),
		TvSummaryRaw.extend({
			media_type: z.literal("tv"),
			character: nullableText,
			credit_id: z.string(),
		}),
	])
	.transform((c): PersonCredit =>
		c.media_type === "movie"
			? { ...toMovieSummary(c), character: c.character, creditId: c.credit_id }
			: { ...toTvSummary(c), character: c.character, creditId: c.credit_id }
	);

const PersonCrewRaw = z
	.discriminatedUnion("media_type", [
		MovieSummaryRaw.extend({
			media_type: z.literal("movie"),
			job: z.string().default(""),
			credit_id: z.string(),
		}),
		TvSummaryRaw.extend({
			media_type: z.literal("tv"),
			job: z.string().default(""),
			credit_id: z.string(),
		}),
	])
	.transform((c): PersonCredit =>
		c.media_type === "movie"
			? { ...toMovieSummary(c), job: c.job, creditId: c.credit_id }
			: { ...toTvSummary(c), job: c.job, creditId: c.credit_id }
	);

// Validates append_to_response=combined_credits,external_ids.
export const PersonSchema = z
	.object({
		id: z.number(),
		name: z.string().default(""),
		biography: z.string().default(""),
		birthday: dateStr,
		deathday: dateStr,
		place_of_birth: nullableText,
		known_for_department: nullableText,
		profile_path: imagePath,
		external_ids: ExternalIdsRaw,
		combined_credits: z
			.object({
				cast: lenientArray(PersonCastRaw).default([]),
				crew: lenientArray(PersonCrewRaw).default([]),
			})
			.default({ cast: [], crew: [] }),
	})
	.transform((p): PersonDetails => ({
		id: p.id,
		name: p.name,
		biography: p.biography,
		birthday: p.birthday,
		deathday: p.deathday,
		placeOfBirth: p.place_of_birth,
		knownForDepartment: p.known_for_department,
		profilePath: p.profile_path,
		externalIds: p.external_ids,
		credits: { cast: p.combined_credits.cast, crew: p.combined_credits.crew },
	}));

export type PersonDetailsData = z.infer<typeof PersonSchema>;
