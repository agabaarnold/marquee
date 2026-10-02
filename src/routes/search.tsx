import { Link, createFileRoute } from "@tanstack/react-router";
// oxlint-disable react/function-component-definition func-style
import { Suspense } from "react";

import { MediaGridSkeleton } from "#/components/media/media-grid-skeleton.tsx";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty.tsx";
import {
	segmentedControlItemVariants,
	segmentedControlRootClassName,
} from "#/lib/segmented-control.ts";
import { searchQuery } from "#/queries/search.ts";
import { SearchPageSearch } from "#/schemas/discover.ts";

import { SearchForm } from "./-components/search-form.tsx";
import { SearchResults } from "./-components/search-results.tsx";

const TYPES = [
	{ value: "all", label: "All" },
	{ value: "movie", label: "Movies" },
	{ value: "tv", label: "TV" },
	{ value: "person", label: "People" },
] as const;

export const Route = createFileRoute("/search")({
	component: SearchPage,
	validateSearch: SearchPageSearch,
	loaderDeps: ({ search }) => search,
	loader: ({ context: { queryClient }, deps }) => {
		if (!deps.q) {
			return null;
		}
		return queryClient.query({
			...searchQuery(
				deps.type === "all" ? "multi" : deps.type,
				deps.q,
				deps.page
			),
			staleTime: "static",
		});
	},
	head: () => ({
		meta: [
			{ title: "Search · Marquee" },
			{
				name: "description",
				content: "Search movies, TV series, and people.",
			},
		],
	}),
	pendingComponent: SearchPending,
});

function SearchPending() {
	return (
		<div
			aria-busy="true"
			className="marquee-container page-transition space-y-6 py-8"
		>
			<h1 className="font-heading text-foreground text-3xl">Search</h1>
			<MediaGridSkeleton />
		</div>
	);
}

function SearchPage() {
	const search = Route.useSearch();

	return (
		<div className="marquee-container page-transition space-y-6 py-8">
			<h1 className="font-heading text-foreground text-3xl">Search</h1>
			<SearchForm key={search.q} initialQuery={search.q} />
			<fieldset className={segmentedControlRootClassName}>
				<legend className="sr-only">Result type</legend>
				{TYPES.map((option) => (
					<Link
						key={option.value}
						aria-current={search.type === option.value ? "page" : undefined}
						className={segmentedControlItemVariants(
							search.type === option.value ? { state: "current" } : {}
						)}
						from="/search"
						search={(previous) => ({
							...previous,
							page: 1,
							type: option.value,
						})}
					>
						{option.label}
					</Link>
				))}
			</fieldset>
			{search.q ? (
				<Suspense fallback={<MediaGridSkeleton />}>
					<SearchResults
						page={search.page}
						query={search.q}
						type={search.type === "all" ? "multi" : search.type}
						uiType={search.type}
					/>
				</Suspense>
			) : (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Search everything on screen</EmptyTitle>
						<EmptyDescription>
							Type at least 2 characters to search movies, series, and people.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
