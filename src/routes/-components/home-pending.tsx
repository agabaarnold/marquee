import { Skeleton } from "#/components/ui/skeleton.tsx";

import { RailSkeleton } from "./rail-skeleton.tsx";

export const HomePending = () => (
	<div
		aria-busy="true"
		className="marquee-container page-transition space-y-10 py-8"
	>
		<div className="overflow-hidden rounded-xl">
			<Skeleton className="h-80 w-full" />
		</div>

		<RailSkeleton title="Trending now" />
		<RailSkeleton title="Popular Movies" />
		<RailSkeleton title="Popular Series" />
	</div>
);
