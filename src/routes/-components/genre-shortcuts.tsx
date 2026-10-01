import { useSuspenseQuery } from "@tanstack/react-query";

import { GenreChips } from "#/components/media/genre-chips.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { genresQuery } from "#/queries/media.ts";

const PLACEHOLDERS = ["a", "b", "c", "d", "e", "f"] as const;

export const GenreShortcutsSkeleton = () => (
	<section aria-busy="true" aria-label="Browse by genre" className="space-y-3">
		<h2 className="font-heading text-foreground text-xl">Browse by genre</h2>
		<div aria-hidden="true" className="flex flex-wrap gap-1.5">
			{PLACEHOLDERS.map((key) => (
				<div key={key} className="h-6 w-16 overflow-hidden rounded-full">
					<Skeleton className="size-full" />
				</div>
			))}
		</div>
	</section>
);

export const GenreShortcuts = () => {
	const { data: genres } = useSuspenseQuery(genresQuery("movie"));
	return (
		<section aria-label="Browse by genre" className="space-y-3">
			<h2 className="font-heading text-foreground text-xl">Browse by genre</h2>
			<GenreChips genres={genres.slice(0, 8)} mediaType="movie" />
		</section>
	);
};
