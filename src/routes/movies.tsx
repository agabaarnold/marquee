// oxlint-disable react/function-component-definition func-style
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { MediaGridSkeleton } from "#/components/media/media-grid-skeleton.tsx";
import { MediaGrid } from "#/components/media/media-grid.tsx";
import { PaginationNav } from "#/components/navigation/pagination-nav.tsx";
import { searchHref } from "#/lib/search-params.ts";
import {
	segmentedControlItemVariants,
	segmentedControlRootClassName,
} from "#/lib/segmented-control.ts";
import { listQuery } from "#/queries/media.ts";
import { ListCategory } from "#/schemas/discover.ts";

const CATEGORIES = [
	{ value: "popular", label: "Popular" },
	{ value: "top_rated", label: "Top rated" },
	{ value: "now_playing", label: "Now playing" },
	{ value: "upcoming", label: "Upcoming" },
] as const;

const moviesSearch = z.object({
	category: ListCategory.movie.default("popular"),
	page: z.number().int().min(1).max(500).default(1),
});

export const Route = createFileRoute("/movies")({
	component: MoviesHub,
	validateSearch: moviesSearch,
	loaderDeps: ({ search }) => search,
	loader: async ({ context: { queryClient }, deps }) => {
		await queryClient.query({
			...listQuery("movie", deps.category, deps.page),
			staleTime: "static",
		});
	},
	head: () => ({
		meta: [
			{ title: "Movies · Marquee" },
			{
				name: "description",
				content: "Browse popular, top-rated, now-playing, and upcoming movies.",
			},
		],
	}),
	pendingComponent: HubPending,
});

function HubPending() {
	return (
		<div
			aria-busy="true"
			className="marquee-container page-transition space-y-6 py-8"
		>
			<h1 className="font-heading text-foreground text-3xl">Movies</h1>
			<MediaGridSkeleton />
		</div>
	);
}

function MoviesHub() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(
		listQuery("movie", search.category, search.page)
	);

	return (
		<div className="marquee-container page-transition space-y-6 py-8">
			<h1 className="font-heading text-foreground text-3xl">Movies</h1>
			<fieldset className={segmentedControlRootClassName}>
				<legend className="sr-only">Category</legend>
				{CATEGORIES.map((option) => (
					<Link
						key={option.value}
						aria-current={search.category === option.value ? "page" : undefined}
						className={segmentedControlItemVariants(
							search.category === option.value ? { state: "current" } : {}
						)}
						from="/movies"
						search={(previous) => ({
							...previous,
							category: option.value,
							page: 1,
						})}
					>
						{option.label}
					</Link>
				))}
			</fieldset>
			<MediaGrid
				items={data.results}
				emptyTitle="No movies found"
				emptyDescription="Try a different category."
			/>
			<PaginationNav
				hrefForPage={(next) =>
					searchHref("/movies", { category: search.category, page: next })
				}
				page={data.page}
				totalPages={data.totalPages}
			/>
		</div>
	);
}
