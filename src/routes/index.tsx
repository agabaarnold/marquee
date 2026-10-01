// oxlint-disable react/function-component-definition func-style
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";

import { MediaRail } from "#/components/media/media-rail.tsx";
import { imageUrl } from "#/lib/images.ts";
import { genresQuery, listQuery, trendingQuery } from "#/queries/media.ts";
import { TimeWindow } from "#/schemas/common.ts";

import {
	GenreShortcuts,
	GenreShortcutsSkeleton,
} from "./-components/genre-shortcuts.tsx";
import { Hero } from "./-components/hero.tsx";
import { HomePending } from "./-components/home-pending.tsx";
import { ListRail } from "./-components/list-rail.tsx";
import { RailSkeleton } from "./-components/rail-skeleton.tsx";
import { TrendingToggles } from "./-components/trending-toggles.tsx";

const homeSearch = z.object({
	window: TimeWindow.default("week"),
	trending: z.enum(["all", "movie", "tv"]).default("all"),
});

// Prefetching must never fail navigation; errors are swallowed here.
const prefetch = async <T,>(load: () => Promise<T>): Promise<void> => {
	try {
		await load();
	} catch {
		// Prefetch errors are intentionally ignored.
	}
};

export const Route = createFileRoute("/")({
	component: Home,
	validateSearch: homeSearch,
	loaderDeps: ({ search }) => search,
	loader: async ({ context: { queryClient }, deps }) => {
		// Above the fold: hero + trending rail block this render; static means
		// fetch only when the cache is empty.
		const trending = await queryClient.query({
			...trendingQuery(deps.trending, deps.window),
			staleTime: "static",
		});

		// Below the fold: stream in under per-rail Suspense boundaries.
		void prefetch(() => queryClient.query(listQuery("movie", "popular")));
		void prefetch(() => queryClient.query(listQuery("tv", "popular")));
		void prefetch(() => queryClient.query(listQuery("movie", "top_rated")));
		void prefetch(() => queryClient.query(listQuery("tv", "airing_today")));
		void prefetch(() => queryClient.query(genresQuery("movie")));
		const [hero] = trending.results;

		return {
			title: hero?.title ?? "Marquee",
			backdrop: hero?.backdropPath ?? null,
		};
	},
	head: ({ loaderData }) => {
		const image = loaderData?.backdrop
			? imageUrl(loaderData.backdrop, 1280)
			: undefined;

		return {
			meta: [
				{ title: "Marquee · Everything on screen" },
				{
					name: "description",
					content:
						"Discover trending movies and TV series, browse by genre, and keep a local watchlist.",
				},
				...(image ? [{ property: "og:image", content: image }] : []),
			],
		};
	},
	pendingComponent: HomePending,
});

function Home() {
	const search = Route.useSearch();
	const { data: trending } = useSuspenseQuery(
		trendingQuery(search.trending, search.window)
	);

	return (
		<div className="marquee-container page-transition space-y-10 py-8">
			<Hero items={trending.results} />

			<section aria-label="Trending" className="space-y-3">
				<TrendingToggles trending={search.trending} window={search.window} />
				<MediaRail items={trending.results} priority title="Trending now" />
			</section>

			<Suspense fallback={<RailSkeleton title="Popular Movies" />}>
				<ListRail
					category="popular"
					href="/movies?category=popular"
					title="Popular Movies"
					type="movie"
				/>
			</Suspense>

			<Suspense fallback={<RailSkeleton title="Popular Series" />}>
				<ListRail
					category="popular"
					href="/tv?category=popular"
					title="Popular Series"
					type="tv"
				/>
			</Suspense>

			<Suspense fallback={<RailSkeleton title="Top Rated Movies" />}>
				<ListRail
					category="top_rated"
					href="/movies?category=top_rated"
					title="Top Rated Movies"
					type="movie"
				/>
			</Suspense>

			<Suspense fallback={<RailSkeleton title="Airing Today" />}>
				<ListRail
					category="airing_today"
					href="/tv?category=airing_today"
					title="Airing Today"
					type="tv"
				/>
			</Suspense>

			<Suspense fallback={<GenreShortcutsSkeleton />}>
				<GenreShortcuts />
			</Suspense>
		</div>
	);
}
