import { Link } from "@tanstack/react-router";

import { MediaTypeBadge } from "#/components/media/media-type-badge.tsx";
import { RatingRing } from "#/components/media/rating-ring.tsx";
import { imageUrl } from "#/lib/images.ts";
import { mediaPath } from "#/lib/slug.ts";
import type { MediaSummary } from "#/types/media.ts";

export const Hero = ({ media }: { media: MediaSummary }) => {
	const backdrop = imageUrl(media.backdropPath, 1280);
	return (
		<section aria-label={`Spotlight: ${media.title}`} className="hero">
			{backdrop && (
				// Sits under the .hero::after scrim gradient.
				<img
					alt=""
					className="absolute inset-0 -z-10 size-full object-cover"
					decoding="async"
					fetchPriority="high"
					src={backdrop}
				/>
			)}
			<div className="relative flex min-h-80 flex-col justify-end gap-3 p-6 sm:p-8">
				<MediaTypeBadge mediaType={media.mediaType} />
				<h1 className="font-heading max-w-3xl text-4xl text-white sm:text-5xl">
					{media.title}
				</h1>
				{media.overview && (
					<p className="line-clamp-3 max-w-2xl text-sm text-white/80 sm:text-base">
						{media.overview}
					</p>
				)}
				<div className="mt-1 flex items-center gap-4">
					<RatingRing value={media.rating} votes={media.voteCount} />
					<Link
						className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium"
						to={mediaPath(media)}
					>
						More info
					</Link>
				</div>
			</div>
		</section>
	);
};
