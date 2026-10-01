import { Link } from "@tanstack/react-router";

import { PosterCard } from "#/components/media/poster-card.tsx";
import type { MediaSummary } from "#/types/media.ts";

export const MediaRail = ({
	title,
	items,
	href,
	priority = false,
}: {
	title: string;
	items: MediaSummary[];
	/** Plain href for a "see all" link — swap for a typed <Link> once the route exists. */
	href?: string;
	/** First rail on the page: let its first few cards load eagerly. */
	priority?: boolean;
}) => {
	if (items.length === 0) {
		return null;
	}

	return (
		<section aria-label={title} className="space-y-3">
			<div className="flex items-baseline justify-between gap-4">
				<h2 className="font-heading text-foreground text-xl">{title}</h2>
				{href && (
					<Link
						className="text-muted-foreground hover:text-primary text-sm font-medium"
						to={href}
					>
						See all
					</Link>
				)}
			</div>

			<div className="media-rail">
				{items.map((item, index) => (
					<PosterCard
						key={`${item.mediaType}-${item.id}`}
						media={item}
						priority={priority && index < 3}
					/>
				))}
			</div>
		</section>
	);
};
