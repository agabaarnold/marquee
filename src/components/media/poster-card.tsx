import { Link } from "@tanstack/react-router";
import { cn } from "cn";

import { MediaTypeBadge } from "#/components/media/media-type-badge.tsx";
import { RatingRing } from "#/components/media/rating-ring.tsx";
import { imageSrcSet, imageUrl } from "#/lib/images.ts";
import { mediaPath } from "#/lib/slug.ts";
import type { MediaSummary } from "#/types/media.ts";

export const PosterCard = ({
	media,
	priority = false,
	showRating = true,
	showBadge = true,
	className,
}: {
	media: MediaSummary;
	/** First row of a rail/grid: skip lazy-loading and hint the browser to fetch it first. */
	priority?: boolean;
	showRating?: boolean;
	showBadge?: boolean;
	className?: string;
}) => {
	const src = imageUrl(media.posterPath, 342);
	const label = media.year ? `${media.title} (${media.year})` : media.title;

	return (
		// NOTE: swap for <Link to="/movie/$movieId" params={{ movieId: mediaSlugParam(media) }} />
		// (or /tv/$tvId) once those routes exist.
		<Link
			aria-label={label}
			className={cn("poster-card group block", className)}
			data-media={media.mediaType}
			to={mediaPath(media)}
		>
			<div className="poster relative overflow-hidden">
				{src ? (
					<img
						alt=""
						className="size-full object-cover"
						decoding="async"
						fetchPriority={priority ? "high" : "auto"}
						loading={priority ? "eager" : "lazy"}
						sizes="(min-width: 1536px) 14vw, (min-width: 1024px) 18vw, (min-width: 640px) 30vw, 46vw"
						src={src}
						srcSet={imageSrcSet("poster", media.posterPath)}
					/>
				) : (
					<div className="bg-muted flex size-full items-center justify-center p-3 text-center">
						<span className="font-heading text-muted-foreground text-lg leading-tight">
							{media.title}
						</span>
					</div>
				)}

				{showBadge && (
					<MediaTypeBadge
						className="absolute top-2 left-2"
						mediaType={media.mediaType}
					/>
				)}
				{showRating && media.rating > 0 && (
					<RatingRing
						className="absolute right-2 bottom-2 shadow-lg"
						size="sm"
						value={media.rating}
						votes={media.voteCount}
					/>
				)}
			</div>

			<div className="mt-2">
				<p className="text-foreground group-hover:text-primary truncate text-sm font-medium">
					{media.title}
				</p>
				{media.year && (
					<p className="text-muted-foreground text-xs">{media.year}</p>
				)}
			</div>
		</Link>
	);
};
