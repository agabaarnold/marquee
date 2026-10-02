// oxlint-disable react/function-component-definition func-style
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { GenreChips } from "#/components/media/genre-chips.tsx";
import { MediaRail } from "#/components/media/media-rail.tsx";
import { MediaTypeBadge } from "#/components/media/media-type-badge.tsx";
import { RatingRing } from "#/components/media/rating-ring.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "#/components/ui/avatar.tsx";
import { imageUrl } from "#/lib/images.ts";
import { mediaSlugParam, slugify } from "#/lib/slug.ts";
import { movieQuery } from "#/queries/media.ts";
import { IdSlugParam } from "#/schemas/discover.ts";

export const Route = createFileRoute("/movie/$movieId")({
	component: MoviePage,
	loader: async ({ context: { queryClient }, params }) => {
		let id: number;
		let slug: string;
		try {
			({ id, slug } = IdSlugParam.parse(params.movieId));
		} catch {
			throw notFound();
		}
		const movie = await queryClient.query({
			...movieQuery(id),
			staleTime: "static",
		});
		if (slug !== slugify(movie.title)) {
			throw redirect({
				params: { movieId: mediaSlugParam(movie) },
				to: "/movie/$movieId",
			});
		}
		return {
			backdrop: movie.backdropPath,
			description:
				movie.overview.length > 155
					? `${movie.overview.slice(0, 152)}…`
					: movie.overview,
			title: movie.title,
		};
	},
	head: ({ loaderData }) => {
		const image = loaderData?.backdrop
			? imageUrl(loaderData.backdrop, 1280)
			: undefined;
		return {
			meta: [
				{ title: loaderData ? `${loaderData.title} · Marquee` : "Movie · Marquee" },
				...(loaderData?.description
					? [{ name: "description", content: loaderData.description }]
					: []),
				...(image ? [{ property: "og:image", content: image }] : []),
			],
		};
	},
	pendingComponent: MoviePending,
});

function MoviePending() {
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

function MoviePage() {
	const { movieId } = Route.useParams();
	const { id } = IdSlugParam.parse(movieId);
	const { data: movie } = useSuspenseQuery(movieQuery(id));
	const backdrop = imageUrl(movie.backdropPath, 1280);
	const poster = imageUrl(movie.posterPath, 342);
	const directors = movie.directors.map((person) => person.name).join(", ");

	return (
		<div className="marquee-container page-transition space-y-8 py-8">
			<section aria-label={movie.title} className="space-y-6">
				{backdrop && (
					<div className="overflow-hidden rounded-xl">
						<img
							alt=""
							className="aspect-video w-full object-cover"
							src={backdrop}
						/>
					</div>
				)}
				<div className="flex flex-col gap-6 sm:flex-row">
					{poster && (
						<img
							alt={`Poster for ${movie.title}`}
							className="poster w-40 shrink-0 sm:w-52"
							src={poster}
						/>
					)}
					<div className="min-w-0 flex-1 space-y-3">
						<MediaTypeBadge mediaType="movie" />
						<h1 className="font-heading text-foreground text-3xl sm:text-4xl">
							{movie.title}
						</h1>
						{movie.tagline && (
							<p className="text-muted-foreground italic">{movie.tagline}</p>
						)}
						<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
							{movie.year && <span>{movie.year}</span>}
							{movie.runtimeMinutes !== null && (
								<span>{movie.runtimeMinutes} min</span>
							)}
							{movie.certification && <span>{movie.certification}</span>}
							<RatingRing value={movie.rating} votes={movie.voteCount} />
						</div>
						{movie.overview && <p>{movie.overview}</p>}
						{directors && (
							<p className="text-sm">
								<span className="text-muted-foreground">Directed by </span>
								{directors}
							</p>
						)}
						<GenreChips genres={movie.genres} mediaType="movie" />
					</div>
				</div>
			</section>

			{movie.cast.length > 0 && (
				<section aria-label="Top cast" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">Top cast</h2>
					<div className="flex gap-4 overflow-x-auto pb-2">
						{movie.cast.slice(0, 12).map((person) => (
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

			<dl className="grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt className="text-muted-foreground">Status</dt>
					<dd>{movie.status || "Unknown"}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Original language</dt>
					<dd>{movie.originalLanguage}</dd>
				</div>
				{movie.budget > 0 && (
					<div>
						<dt className="text-muted-foreground">Budget</dt>
						<dd>${movie.budget.toLocaleString()}</dd>
					</div>
				)}
				{movie.revenue > 0 && (
					<div>
						<dt className="text-muted-foreground">Revenue</dt>
						<dd>${movie.revenue.toLocaleString()}</dd>
					</div>
				)}
			</dl>

			{movie.keywords.length > 0 && (
				<section aria-label="Keywords" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">Keywords</h2>
					<GenreChips
						genres={movie.keywords}
						linked={false}
						mediaType="movie"
					/>
				</section>
			)}

			<MediaRail items={movie.recommendations} title="Recommendations" />
			<MediaRail items={movie.similar} title="Similar" />
		</div>
	);
}
