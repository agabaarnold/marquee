import { Skeleton } from "#/components/ui/skeleton.tsx";

export const PosterCardSkeleton = () => (
	<div>
		<div className="poster">
			<Skeleton className="size-full" />
		</div>

		<div className="mt-2 space-y-1.5">
			<Skeleton className="h-4 w-4/5" />
			<Skeleton className="h-3 w-1/3" />
		</div>
	</div>
);
