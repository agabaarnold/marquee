const BASE_URL = "https://image.tmdb.org/t/p";

const WIDTHS = {
	poster: [185, 342, 500, 780],
	backdrop: [300, 780, 1280],
	profile: [185],
	still: [185, 300],
	logo: [92, 185, 300],
} as const;

export type ImageKind = keyof typeof WIDTHS;

export const imageUrl = (path: string | null, width: number): string | null =>
	path ? `${BASE_URL}/w${width}${path}` : null;

export const imageSrcSet = (
	kind: ImageKind,
	path: string | null
): string | undefined =>
	path
		? WIDTHS[kind].map((w) => `${BASE_URL}/w${w}${path} ${w}w`).join(", ")
		: undefined;
