// oxlint-disable react/function-component-definition func-style
import { Link, createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { z } from "zod";

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
import { imageUrl } from "#/lib/images.ts";
import { mediaPath } from "#/lib/slug.ts";
import { useWatchlist } from "#/features/watchlist/store.ts";
import type { WatchlistItem } from "#/schemas/watchlist.ts";

const watchlistSearch = z.object({
	filter: z.enum(["all", "movie", "tv"]).default("all"),
	status: z.enum(["all", "planned", "watching", "watched"]).default("all"),
});

const TYPE_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "movie", label: "Movies" },
	{ value: "tv", label: "Series" },
] as const;

const STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "planned", label: "Planned" },
	{ value: "watching", label: "Watching" },
	{ value: "watched", label: "Watched" },
] as const;

const NEXT_STATUS: Record<
	Exclude<WatchlistItem["status"], undefined>,
	WatchlistItem["status"]
> = {
	planned: "watching",
	watching: "watched",
	watched: "planned",
};

export const Route = createFileRoute("/watchlist")({
	component: WatchlistPage,
	validateSearch: watchlistSearch,
	head: () => ({
		meta: [
			{ title: "Watchlist · Marquee" },
			{
				name: "description",
				content: "Your local-first watchlist of movies and series.",
			},
		],
	}),
});

function WatchlistRow({ item }: { item: WatchlistItem }) {
	const { remove, setStatus } = useWatchlist();
	const poster = item.posterPath ? imageUrl(item.posterPath, 185) : null;
	const status = item.status ?? "planned";

	return (
		<li className="border-border bg-card flex gap-4 rounded-xl border p-3">
			<Link
				aria-label={`${item.title}, view details`}
				className="w-16 shrink-0"
				to={mediaPath(item)}
			>
				{poster ? (
					<img alt="" className="poster w-full" loading="lazy" src={poster} />
				) : (
					<div className="bg-muted poster flex items-center justify-center p-2 text-center">
						<span className="text-muted-foreground text-xs leading-tight">
							{item.title}
						</span>
					</div>
				)}
			</Link>
			<div className="min-w-0 flex-1 space-y-1">
				<Link
					className="hover:text-primary block truncate font-medium"
					to={mediaPath(item)}
				>
					{item.title}
				</Link>
				<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
					{item.year !== null && <span>{item.year}</span>}
					<span className="capitalize">{status}</span>
				</div>
				<div className="flex flex-wrap gap-2 pt-1">
					<button
						className="text-muted-foreground hover:text-foreground rounded-full border border-border px-3 py-1 text-xs"
						onClick={() => {
							setStatus(item.mediaType, item.id, NEXT_STATUS[status]);
						}}
						type="button"
					>
						Mark as {NEXT_STATUS[status]}
					</button>
					<button
						aria-label={`Remove ${item.title} from watchlist`}
						className="text-muted-foreground hover:text-foreground rounded-full border border-border p-1.5"
						onClick={() => {
							remove(item.mediaType, item.id);
						}}
						type="button"
					>
						<X aria-hidden="true" className="size-4" />
					</button>
				</div>
			</div>
		</li>
	);
}

function WatchlistPage() {
	const search = Route.useSearch();
	const { items } = useWatchlist();
	const visible = items.filter(
		(item) =>
			(search.filter === "all" || item.mediaType === search.filter) &&
			(search.status === "all" || (item.status ?? "planned") === search.status)
	);

	return (
		<div className="marquee-container page-transition space-y-6 py-8">
			<h1 className="font-heading text-foreground text-3xl">Watchlist</h1>
			{items.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Nothing saved yet</EmptyTitle>
						<EmptyDescription>
							Save movies and series to find them here, stored privately in
							this browser.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="space-y-6">
					<div className="flex flex-wrap gap-3">
						<fieldset className={segmentedControlRootClassName}>
							<legend className="sr-only">Media type</legend>
							{TYPE_OPTIONS.map((option) => (
								<Link
									key={option.value}
									aria-current={
										search.filter === option.value ? "page" : undefined
									}
									className={segmentedControlItemVariants(
										search.filter === option.value ? { state: "current" } : {}
									)}
									from="/watchlist"
									search={(previous) => ({
										...previous,
										filter: option.value,
									})}
								>
									{option.label}
								</Link>
							))}
						</fieldset>
						<fieldset className={segmentedControlRootClassName}>
							<legend className="sr-only">Status</legend>
							{STATUS_OPTIONS.map((option) => (
								<Link
									key={option.value}
									aria-current={
										search.status === option.value ? "page" : undefined
									}
									className={segmentedControlItemVariants(
										search.status === option.value ? { state: "current" } : {}
									)}
									from="/watchlist"
									search={(previous) => ({
										...previous,
										status: option.value,
									})}
								>
									{option.label}
								</Link>
							))}
						</fieldset>
					</div>
					{visible.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>No matches for these filters</EmptyTitle>
								<EmptyDescription>
									Try a different type or status.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<ul className="grid gap-3 sm:grid-cols-2">
							{visible.map((item) => (
								<WatchlistRow key={`${item.mediaType}-${item.id}`} item={item} />
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
