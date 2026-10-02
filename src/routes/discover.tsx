import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
// oxlint-disable react/function-component-definition func-style
import { Suspense } from "react";

import { MediaGridSkeleton } from "#/components/media/media-grid-skeleton.tsx";
import { MediaGrid } from "#/components/media/media-grid.tsx";
import { PaginationNav } from "#/components/navigation/pagination-nav.tsx";
import { searchHref } from "#/lib/search-params.ts";
import {
	segmentedControlItemVariants,
	segmentedControlRootClassName,
} from "#/lib/segmented-control.ts";
import { discoverQuery } from "#/queries/media.ts";
import { DiscoverSearch } from "#/schemas/discover.ts";

import {
	DiscoverGenres,
	DiscoverProviders,
	DiscoverYears,
	FilterChip,
	FilterSkeleton,
} from "./-components/discover-filters.tsx";

const SORTS = [
	{ value: "popularity.desc", label: "Most popular" },
	{ value: "vote_average.desc", label: "Top rated" },
	{ value: "primary_release_date.desc", label: "Newest" },
	{ value: "revenue.desc", label: "Highest grossing" },
] as const;

const RATINGS = [
	{ value: 0, label: "Any rating" },
	{ value: 6, label: "6+" },
	{ value: 7, label: "7+" },
	{ value: 8, label: "8+" },
] as const;

export const Route = createFileRoute("/discover")({
	component: DiscoverPage,
	validateSearch: DiscoverSearch,
	loaderDeps: ({ search }) => search,
	loader: async ({ context: { queryClient }, deps }) => {
		await queryClient.query({
			...discoverQuery(deps.type, deps),
			staleTime: "static",
		});
	},
	head: () => ({
		meta: [
			{ title: "Discover · Marquee" },
			{
				name: "description",
				content:
					"Filter movies and series by genre, year, rating, and provider.",
			},
		],
	}),
	pendingComponent: DiscoverPending,
});

function DiscoverPending() {
	return (
		<div
			aria-busy="true"
			className="marquee-container page-transition space-y-6 py-8"
		>
			<h1 className="font-heading text-foreground text-3xl">Discover</h1>
			<MediaGridSkeleton />
		</div>
	);
}

function DiscoverPage() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: "/discover" });
	const { data } = useSuspenseQuery(discoverQuery(search.type, search));
	const region = search.region ?? "US";

	return (
		<div className="marquee-container page-transition space-y-6 py-8">
			<h1 className="font-heading text-foreground text-3xl">Discover</h1>
			<div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
				<div className="space-y-6">
					<fieldset className={segmentedControlRootClassName}>
						<legend className="sr-only">Media type</legend>
						<Link
							aria-current={search.type === "movie" ? "page" : undefined}
							className={segmentedControlItemVariants(
								search.type === "movie" ? { state: "current" } : {}
							)}
							from="/discover"
							search={(previous) => ({
								...previous,
								genres: [],
								page: 1,
								providers: [],
								type: "movie",
							})}
						>
							Movies
						</Link>
						<Link
							aria-current={search.type === "tv" ? "page" : undefined}
							className={segmentedControlItemVariants(
								search.type === "tv" ? { state: "current" } : {}
							)}
							from="/discover"
							search={(previous) => ({
								...previous,
								genres: [],
								page: 1,
								providers: [],
								type: "tv",
							})}
						>
							Series
						</Link>
					</fieldset>

					<Suspense fallback={<FilterSkeleton label="Genres" />}>
						<DiscoverGenres active={search.genres} mediaType={search.type} />
					</Suspense>

					<DiscoverYears
						key={`${search.yearFrom ?? ""}-${search.yearTo ?? ""}`}
						from={search.yearFrom}
						onApply={(years) => {
							void navigate({
								search: (previous) => ({ ...previous, ...years, page: 1 }),
							});
						}}
						to={search.yearTo}
					/>

					<fieldset>
						<legend className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
							Minimum rating
						</legend>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{RATINGS.map((option) => (
								<FilterChip
									key={option.value}
									active={search.minRating === option.value}
									search={(previous) => ({
										...previous,
										minRating: option.value,
										page: 1,
									})}
								>
									{option.label}
								</FilterChip>
							))}
						</div>
					</fieldset>

					<fieldset>
						<legend className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
							Sort by
						</legend>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{SORTS.map((option) => (
								<FilterChip
									key={option.value}
									active={search.sort === option.value}
									search={(previous) => ({
										...previous,
										page: 1,
										sort: option.value,
									})}
								>
									{option.label}
								</FilterChip>
							))}
						</div>
					</fieldset>

					<Suspense fallback={<FilterSkeleton label="Streaming providers" />}>
						<DiscoverProviders
							active={search.providers}
							mediaType={search.type}
							region={region}
						/>
					</Suspense>
					{/* NOTE: region picker is fixed to US until a region selector lands. */}

					<Link
						className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-2"
						from="/discover"
						search={{ type: search.type }}
					>
						Reset all
					</Link>
				</div>

				<div className="min-w-0 space-y-6">
					<MediaGrid
						items={data.results}
						emptyTitle="No titles match these filters"
						emptyDescription="Try relaxing the rating, years, or genres."
					/>
					<PaginationNav
						hrefForPage={(next) =>
							searchHref("/discover", { ...search, page: next })
						}
						page={data.page}
						totalPages={data.totalPages}
					/>
				</div>
			</div>
		</div>
	);
}
