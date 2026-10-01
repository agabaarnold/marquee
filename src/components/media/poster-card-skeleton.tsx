import { Skeleton } from "#/components/ui/skeleton.tsx";

export const PosterCardSkeleton = () => (
	<div className="border-border bg-card overflow-hidden rounded-xl border">
		<div className="poster">
			<Skeleton className="size-full" />
		</div>

		<div className="space-y-1.5 px-3 pt-2 pb-3">
			<Skeleton className="h-4 w-4/5" />
			<Skeleton className="h-3 w-1/3" />
		</div>
	</div>
);
