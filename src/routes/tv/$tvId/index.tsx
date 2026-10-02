// oxlint-disable react/function-component-definition func-style
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	createFileRoute,
	notFound,
	redirect,
} from "@tanstack/react-router";

import { GenreChips } from "#/components/media/genre-chips.tsx";
import { MediaRail } from "#/components/media/media-rail.tsx";
import { MediaTypeBadge } from "#/components/media/media-type-badge.tsx";
import { RatingRing } from "#/components/media/rating-ring.tsx";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "#/components/ui/avatar.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { imageUrl } from "#/lib/images.ts";
import { mediaSlugParam, slugify } from "#/lib/slug.ts";
import { tvQuery } from "#/queries/media.ts";
import { IdSlugParam } from "#/schemas/discover.ts";
import type { EpisodeSummary, SeasonSummary } from "#/types/media.ts";

export const Route = createFileRoute("/tv/$tvId/")({
	component: TvPage,
	loader: async ({ context: { queryClient }, params }) => {
		let id: number;
		let slug: string;
		try {
			({ id, slug } = IdSlugParam.parse(params.tvId));
		} catch {
			throw notFound();
		}
		const show = await queryClient.query({
			...tvQuery(id),
			staleTime: "static",
		});
		if (slug !== slugify(show.title)) {
			throw redirect({
				params: { tvId: mediaSlugParam(show) },
				to: "/tv/$tvId",
			});
		}
		return {
			backdrop: show.backdropPath,
			description:
				show.overview.length > 155
					? `${show.overview.slice(0, 152)}…`
					: show.overview,
			title: show.title,
		};
	},
	head: ({ loaderData }) => {
		const image = loaderData?.backdrop
			? imageUrl(loaderData.backdrop, 1280)
			: undefined;
		return {
			meta: [
				{
					title: loaderData
						? `${loaderData.title} · Marquee`
						: "Series · Marquee",
				},
				...(loaderData?.description
					? [{ name: "description", content: loaderData.description }]
					: []),
				...(image ? [{ property: "og:image", content: image }] : []),
			],
		};
	},
	pendingComponent: TvPending,
});

function TvPending() {
	return (
		<div
			aria-busy="true"
			className="marquee-container page-transition space-y-8 py-8"
		>
			<div className="overflow-hidden rounded-xl">
				<Skeleton className="aspect-video w-full" />
			</div>
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
		</div>
	);
}

const initialsOf = (name: string): string =>
	name
		.split(" ")
		.map((part) => part[0] ?? "")
		.slice(0, 2)
		.join("");

function EpisodeCard({
	episode,
	label,
}: {
	episode: EpisodeSummary;
	label: string;
}) {
	const still = imageUrl(episode.stillPath, 300);
	return (
		<div className="border-border bg-card flex gap-4 rounded-xl border p-3">
			{still && (
				<img
					alt=""
					className="aspect-video w-32 shrink-0 rounded-lg object-cover"
					loading="lazy"
					src={still}
				/>
			)}
			<div className="min-w-0 space-y-1">
				<p className="text-muted-foreground text-xs">
					{label} · S{episode.seasonNumber} E{episode.episodeNumber}
				</p>
				<p className="truncate font-medium">{episode.name}</p>
				{episode.airDate && (
					<p className="text-muted-foreground text-xs">{episode.airDate}</p>
				)}
			</div>
		</div>
	);
}

function SeasonCard({
	showSlug,
	season,
}: {
	showSlug: string;
	season: SeasonSummary;
}) {
	const poster = imageUrl(season.posterPath, 185);
	return (
		<Link
			className="poster-card group border-border bg-card block overflow-hidden rounded-xl border"
			params={{ seasonNumber: `${season.seasonNumber}`, tvId: showSlug }}
			to="/tv/$tvId/season/$seasonNumber"
		>
			{poster ? (
				<img
					alt={`Poster for ${season.name}`}
					className="poster"
					loading="lazy"
					src={poster}
				/>
			) : (
				<div className="bg-muted poster flex items-center justify-center p-3 text-center">
					<span className="font-heading text-muted-foreground text-lg leading-tight">
						{season.name}
					</span>
				</div>
			)}
			<div className="space-y-1 px-3 pt-2 pb-3">
				<p className="text-foreground group-hover:text-primary truncate text-sm font-medium">
					{season.name}
				</p>
				<p className="text-muted-foreground text-xs">
					{season.episodeCount} episodes
				</p>
			</div>
		</Link>
	);
}

function TvPage() {
	const { tvId } = Route.useParams();
	const { id } = IdSlugParam.parse(tvId);
	const { data: show } = useSuspenseQuery(tvQuery(id));
	const backdrop = imageUrl(show.backdropPath, 1280);
	const poster = imageUrl(show.posterPath, 342);
	const creators = show.creators.map((person) => person.name).join(", ");
	const networks = show.networks.map((network) => network.name).join(", ");
	const showSlug = mediaSlugParam(show);
	const titleTone = backdrop ? "text-white" : "text-foreground";
	const dimTone = backdrop ? "text-white/70" : "text-muted-foreground";
	const bodyTone = backdrop ? "text-white/90" : undefined;

	return (
		<div className="marquee-container page-transition space-y-8 py-8">
			<section
				aria-label={show.title}
				className="relative overflow-hidden rounded-xl"
			>
				{backdrop && (
					<img
						alt=""
						className="absolute inset-0 size-full object-cover"
						src={backdrop}
					/>
				)}
				{backdrop && (
					<div
						aria-hidden="true"
						className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
					/>
				)}
				<div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
					{poster && (
						<img
							alt={`Poster for ${show.title}`}
							className="poster w-40 shrink-0 shadow-2xl sm:w-52"
							src={poster}
						/>
					)}
					<div className="min-w-0 flex-1 space-y-3">
						<MediaTypeBadge mediaType="tv" />
						<h1 className={`font-heading text-3xl sm:text-4xl ${titleTone}`}>
							{show.title}
						</h1>
						{show.tagline && (
							<p className={`${dimTone} italic`}>{show.tagline}</p>
						)}
						<div
							className={`${dimTone} flex flex-wrap items-center gap-x-3 gap-y-1 text-sm`}
						>
							{show.year && <span>{show.year}</span>}
							<span>
								{show.numberOfSeasons}{" "}
								{show.numberOfSeasons === 1 ? "season" : "seasons"}
							</span>
							<span>{show.numberOfEpisodes} episodes</span>
							{show.certification && <span>{show.certification}</span>}
							<RatingRing value={show.rating} votes={show.voteCount} />
						</div>
						{show.overview && <p className={bodyTone}>{show.overview}</p>}
						{creators && (
							<p className="text-sm">
								<span className={dimTone}>Created by </span>
								<span className={bodyTone}>{creators}</span>
							</p>
						)}
						{networks && (
							<p className="text-sm">
								<span className={dimTone}>Networks </span>
								<span className={bodyTone}>{networks}</span>
							</p>
						)}
						<GenreChips genres={show.genres} mediaType="tv" />
					</div>
				</div>
			</section>

			{show.cast.length > 0 && (
				<section aria-label="Top cast" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">Top cast</h2>
					<div className="flex gap-4 overflow-x-auto pb-2">
						{show.cast.slice(0, 12).map((person) => (
							<div key={person.id} className="w-20 shrink-0 space-y-1">
								<Avatar className="size-16">
									{person.profilePath && (
										<AvatarImage
											alt={person.name}
											src={imageUrl(person.profilePath, 185) ?? undefined}
										/>
									)}
									<AvatarFallback>{initialsOf(person.name)}</AvatarFallback>
								</Avatar>
								<p className="truncate text-sm font-medium">{person.name}</p>
								{person.character && (
									<p className="text-muted-foreground truncate text-xs">
										{person.character}
									</p>
								)}
							</div>
						))}
					</div>
				</section>
			)}

			{show.seasons.length > 0 && (
				<section aria-label="Seasons" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">Seasons</h2>
					<div className="poster-grid">
						{show.seasons.map((season) => (
							<SeasonCard key={season.id} season={season} showSlug={showSlug} />
						))}
					</div>
				</section>
			)}

			{(show.lastEpisodeToAir || show.nextEpisodeToAir) && (
				<section aria-label="Episodes" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">Episodes</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{show.lastEpisodeToAir && (
							<EpisodeCard
								episode={show.lastEpisodeToAir}
								label="Last episode to air"
							/>
						)}
						{show.nextEpisodeToAir && (
							<EpisodeCard
								episode={show.nextEpisodeToAir}
								label="Next episode to air"
							/>
						)}
					</div>
				</section>
			)}

			<MediaRail items={show.recommendations} title="Recommendations" />
			<MediaRail items={show.similar} title="Similar" />
		</div>
	);
}
