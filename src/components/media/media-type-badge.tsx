import { cn } from "cn";

import type { MediaType } from "#/schemas/common.ts";

const LABEL: Record<MediaType, string> = { movie: "Movie", tv: "Series" };

export const MediaTypeBadge = ({
	mediaType,
	className,
}: {
	mediaType: MediaType;
	className?: string;
}) => (
	<span className={cn("media-badge", className)} data-media={mediaType}>
		{LABEL[mediaType]}
	</span>
);
