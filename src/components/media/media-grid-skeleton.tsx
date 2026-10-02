import { PosterCardSkeleton } from "#/components/media/poster-card-skeleton.tsx";

const SKELETON_KEYS = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
] as const;

export const MediaGridSkeleton = () => (
	<div aria-hidden="true" className="poster-grid">
		{SKELETON_KEYS.map((key) => (
			<PosterCardSkeleton key={key} />
		))}
	</div>
);
