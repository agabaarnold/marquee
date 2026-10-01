import { PosterCard } from "#/components/media/poster-card.tsx";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty.tsx";
import type { MediaSummary } from "#/types/media.ts";

export const MediaGrid = ({
	items,
	emptyTitle = "Nothing here yet",
	emptyDescription = "Try a different filter or search.",
}: {
	items: MediaSummary[];
	emptyTitle?: string;
	emptyDescription?: string;
}) => {
	if (items.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{emptyTitle}</EmptyTitle>
					<EmptyDescription>{emptyDescription}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="poster-grid">
			{items.map((item) => (
				<PosterCard key={`${item.mediaType}-${item.id}`} media={item} />
			))}
		</div>
	);
};
