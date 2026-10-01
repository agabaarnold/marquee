import { PosterCardSkeleton } from "#/components/media/poster-card-skeleton.tsx";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"] as const;

export const RailSkeleton = ({ title }: { title: string }) => (
	<section aria-busy="true" aria-label={title} className="space-y-3">
		<h2 className="font-heading text-foreground text-xl">{title}</h2>
		<div aria-hidden="true" className="media-rail">
			{SKELETON_KEYS.map((key) => (
				<PosterCardSkeleton key={key} />
			))}
		</div>
	</section>
);
