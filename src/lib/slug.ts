import type { MediaSummary } from "#/types/media.ts";

export const slugify = (text: string): string =>
	text
		.toLowerCase()
		.normalize("NFKD")
		.replaceAll(/[\u0300-\u036F]/gu, "")
		.replaceAll(/[^a-z0-9]+/gu, "-")
		.replaceAll(/(?<trim>^-|-$)/gu, "");

/** "550-fight-club" — matches the IdSlugParam shape planned for the detail routes. */
export const mediaSlugParam = (
	media: Pick<MediaSummary, "id" | "title">
): string => {
	const slug = slugify(media.title);
	return slug ? `${media.id}-${slug}` : String(media.id);
};

/**
 * Plain href for use before the /movie/$movieId and /tv/$tvId routes exist.
 * Swap call sites for a typed <Link to="/movie/$movieId" params={{ movieId: mediaSlugParam(media) }} />
 * (or /tv/$tvId) once those routes are scaffolded.
 */
export const mediaPath = (
	media: Pick<MediaSummary, "mediaType" | "id" | "title">
): string => `/${media.mediaType}/${mediaSlugParam(media)}`;
