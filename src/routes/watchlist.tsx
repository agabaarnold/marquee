// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "#/components/ui/empty.tsx";

const watchlistSearch = z.object({
	filter: z.enum(["all", "movie", "tv"]).default("all"),
	status: z.enum(["all", "planned", "watching", "watched"]).default("all"),
});

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

function WatchlistPage() {
	return (
		<div className="marquee-container page-transition space-y-6 py-8">
			<h1 className="font-heading text-foreground text-3xl">Watchlist</h1>
			{/* NOTE: wires up once the local-first watchlist store (milestone 7) lands. */}
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Nothing saved yet</EmptyTitle>
					<EmptyDescription>
						Your watchlist will live here, stored privately in this browser.
						The local-first store is still on the roadmap.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}
