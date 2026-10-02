// oxlint-disable react/function-component-definition func-style
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	createFileRoute,
	notFound,
	redirect,
} from "@tanstack/react-router";

import { Skeleton } from "#/components/ui/skeleton.tsx";
import { imageUrl } from "#/lib/images.ts";
import { mediaSlugParam, slugify } from "#/lib/slug.ts";
import { seasonQuery, tvQuery } from "#/queries/media.ts";
import { IdSlugParam, SeasonParam } from "#/schemas/discover.ts";

export const Route = createFileRoute("/tv/$tvId/season/$seasonNumber")({
	component: SeasonPage,
	loader: async ({ context: { queryClient }, params }) => {
		let tvId: number;
		let tvSlug: string;
		let seasonNumber: number;
		try {
			({ id: tvId, slug: tvSlug } = IdSlugParam.parse(params.tvId));
			seasonNumber = SeasonParam.parse(params.seasonNumber);
		} catch {
			throw notFound();
		}
		const [show, season] = await Promise.all([
			queryClient.query({ ...tvQuery(tvId), staleTime: "static" }),
			queryClient.query({
				...seasonQuery(tvId, seasonNumber),
				staleTime: "static",
			}),
		]);
		if (tvSlug !== slugify(show.title)) {
			throw redirect({
				params: {
					tvId: mediaSlugParam(show),
					seasonNumber: `${seasonNumber}`,
				},
				to: "/tv/$tvId/season/$seasonNumber",
			});
		}
		return { seasonName: season.name, showTitle: show.title };
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData
					? `${loaderData.seasonName} · ${loaderData.showTitle} · Marquee`
					: "Season · Marquee",
			},
		],
	}),
	pendingComponent: SeasonPending,
});

function SeasonPending() {
	return (
		<div
			aria-busy="true"
			className="marquee-container page-transition space-y-6 py-8"
		>
			<div className="flex gap-6">
				<div className="h-60 w-40 shrink-0 overflow-hidden rounded-lg">
					<Skeleton className="size-full" />
				</div>
				<div className="flex-1 space-y-3">
					<Skeleton className="h-8 w-2/3" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
				</div>
			</div>
			<div className="space-y-3">
				<div className="overflow-hidden rounded-xl">
					<Skeleton className="h-24 w-full" />
				</div>
				<div className="overflow-hidden rounded-xl">
					<Skeleton className="h-24 w-full" />
				</div>
				<div className="overflow-hidden rounded-xl">
					<Skeleton className="h-24 w-full" />
				</div>
			</div>
		</div>
	);
}

function SeasonPage() {
	const { seasonNumber: seasonParam, tvId } = Route.useParams();
	const { id: showId } = IdSlugParam.parse(tvId);
	const seasonNumber = SeasonParam.parse(seasonParam);
	const { data: show } = useSuspenseQuery(tvQuery(showId));
	const { data: season } = useSuspenseQuery(seasonQuery(showId, seasonNumber));
	const poster = imageUrl(season.posterPath, 342);

	return (
		<div className="marquee-container page-transition space-y-8 py-8">
			<section aria-label={`${season.name} of ${show.title}`}>
				<Link
					className="text-muted-foreground hover:text-foreground text-sm"
					params={{ tvId: mediaSlugParam(show) }}
					to="/tv/$tvId"
				>
					← {show.title}
				</Link>
				<div className="mt-4 flex flex-col gap-6 sm:flex-row">
					{poster && (
						<img
							alt={`Poster for ${season.name}`}
							className="poster w-40 shrink-0 sm:w-52"
							src={poster}
						/>
					)}
					<div className="min-w-0 flex-1 space-y-3">
						<h1 className="font-heading text-foreground text-3xl">
							{season.name}
						</h1>
						<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
							{season.airDate && <span>{season.airDate}</span>}
							<span>
								{season.episodeCount}{" "}
								{season.episodeCount === 1 ? "episode" : "episodes"}
							</span>
						</div>
						{season.overview && <p>{season.overview}</p>}
					</div>
				</div>
			</section>

			{show.seasons.length > 1 && (
				<nav aria-label="Seasons" className="flex flex-wrap gap-2">
					{show.seasons.map((item) => {
						const current = item.seasonNumber === season.seasonNumber;
						return (
							<Link
								key={item.id}
								aria-current={current ? "page" : undefined}
								className={
									current
										? "bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm font-medium"
										: "text-muted-foreground hover:text-foreground border-border rounded-full border px-4 py-1.5 text-sm"
								}
								params={{
									seasonNumber: `${item.seasonNumber}`,
									tvId: mediaSlugParam(show),
								}}
								to="/tv/$tvId/season/$seasonNumber"
							>
								{item.seasonNumber === 0
									? "Specials"
									: `Season ${item.seasonNumber}`}
							</Link>
						);
					})}
				</nav>
			)}

			<section aria-label="Episodes" className="space-y-3">
				<h2 className="font-heading text-foreground text-xl">Episodes</h2>
				{season.episodes.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						No episode information available yet.
					</p>
				) : (
					<ol className="space-y-3">
						{season.episodes.map((episode) => {
							const still = imageUrl(episode.stillPath, 300);
							return (
								<li
									key={episode.id}
									className="border-border bg-card flex gap-4 rounded-xl border p-3"
								>
									{still ? (
										<img
											alt=""
											className="aspect-video w-32 shrink-0 rounded-lg object-cover sm:w-44"
											loading="lazy"
											src={still}
										/>
									) : (
										<div className="bg-muted flex aspect-video w-32 shrink-0 items-center justify-center rounded-lg sm:w-44">
											<span className="text-muted-foreground text-2xl font-semibold">
												{episode.episodeNumber}
											</span>
										</div>
									)}
									<div className="min-w-0 flex-1 space-y-1">
										<p className="truncate font-medium">
											<span className="text-muted-foreground mr-2">
												{episode.episodeNumber}
											</span>
											{episode.name}
										</p>
										<div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
											{episode.airDate && <span>{episode.airDate}</span>}
											{episode.runtimeMinutes !== null && (
												<span>{episode.runtimeMinutes} min</span>
											)}
											{episode.rating > 0 && (
												<span>★ {episode.rating.toFixed(1)}</span>
											)}
										</div>
										{episode.overview && (
											<p className="text-muted-foreground line-clamp-3 text-sm">
												{episode.overview}
											</p>
										)}
									</div>
								</li>
							);
						})}
					</ol>
				)}
			</section>
		</div>
	);
}
