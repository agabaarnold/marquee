import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { z } from "zod";

import { MediaGrid } from "#/components/media/media-grid.tsx";
import { PaginationNav } from "#/components/navigation/pagination-nav.tsx";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "#/components/ui/avatar.tsx";
import { imageUrl } from "#/lib/images.ts";
import { searchHref } from "#/lib/search-params.ts";
import { searchQuery } from "#/queries/search.ts";
import type { SearchPageSearch } from "#/schemas/discover.ts";
import type { SearchQueryType } from "#/server/functions/search.ts";

type SearchUiType = z.infer<typeof SearchPageSearch>["type"];

const initialsOf = (name: string): string =>
	name
		.split(" ")
		.map((part) => part[0] ?? "")
		.slice(0, 2)
		.join("");

export const SearchResults = ({
	type,
	query,
	page,
	uiType,
}: {
	type: SearchQueryType;
	query: string;
	page: number;
	uiType: SearchUiType;
}) => {
	const { data } = useSuspenseQuery(searchQuery(type, query, page));
	const media = data.results.filter(
		(item) => "kind" in item && item.kind === "media"
	);
	const people = data.results.filter(
		(item) => "kind" in item && item.kind === "person"
	);

	return (
		<div className="space-y-8">
			{people.length > 0 && (
				<section aria-label="People" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">People</h2>
					<ul className="grid gap-3 sm:grid-cols-2">
						{people.map((person) => (
							<li key={person.id}>
								<Link
									className="border-border bg-card hover:border-muted-foreground flex items-center gap-3 rounded-xl border p-3"
									params={{ personId: `${person.id}` }}
									to="/person/$personId"
								>
									<Avatar className="size-12">
										{person.profilePath && (
											<AvatarImage
												alt={person.name}
												src={imageUrl(person.profilePath, 185) ?? undefined}
											/>
										)}
										<AvatarFallback>{initialsOf(person.name)}</AvatarFallback>
									</Avatar>
									<span className="min-w-0">
										<span className="block truncate font-medium">
											{person.name}
										</span>
										{person.knownFor && (
											<span className="text-muted-foreground block truncate text-sm">
												{person.knownFor}
											</span>
										)}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
			<MediaGrid
				items={media}
				emptyTitle={`No results for "${query}"`}
				emptyDescription="Check the spelling or try a different title."
			/>
			<PaginationNav
				hrefForPage={(next) =>
					searchHref("/search", { page: next, q: query, type: uiType })
				}
				page={data.page}
				totalPages={data.totalPages}
			/>
		</div>
	);
};
