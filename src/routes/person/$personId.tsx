// oxlint-disable react/function-component-definition func-style
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { MediaGrid } from "#/components/media/media-grid.tsx";
import { MediaGridSkeleton } from "#/components/media/media-grid-skeleton.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { imageUrl } from "#/lib/images.ts";
import { personQuery } from "#/queries/person.ts";
import { IdSlugParam } from "#/schemas/discover.ts";
import type { PersonCredit } from "#/types/media.ts";

export const Route = createFileRoute("/person/$personId")({
	component: PersonPage,
	loader: async ({ context: { queryClient }, params }) => {
		let id: number;
		try {
			({ id } = IdSlugParam.parse(params.personId));
		} catch {
			throw notFound();
		}
		const person = await queryClient.query({
			...personQuery(id),
			staleTime: "static",
		});
		return {
			description:
				person.biography.length > 155
					? `${person.biography.slice(0, 152)}…`
					: person.biography,
			name: person.name,
		};
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: loaderData ? `${loaderData.name} · Marquee` : "Person · Marquee" },
			...(loaderData?.description
				? [{ name: "description", content: loaderData.description }]
				: []),
		],
	}),
	pendingComponent: PersonPending,
});

function PersonPending() {
	return (
		<div
			aria-busy="true"
			className="marquee-container page-transition space-y-8 py-8"
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
			<MediaGridSkeleton />
		</div>
	);
}

const byYearDesc = (a: PersonCredit, b: PersonCredit): number =>
	(b.year ?? 0) - (a.year ?? 0);

function PersonPage() {
	const { personId } = Route.useParams();
	const { id } = IdSlugParam.parse(personId);
	const { data: person } = useSuspenseQuery(personQuery(id));
	const profile = imageUrl(person.profilePath, 185);
	const lifespan = [person.birthday, person.deathday]
		.filter((date): date is string => date !== null)
		.join(" – ");
	const cast = [
		...person.credits.cast,
		// oxlint-disable-next-line unicorn/no-array-sort -- sorting a fresh copy; nothing else observes it.
	].sort(byYearDesc);
	const crew = [
		...person.credits.crew,
		// oxlint-disable-next-line unicorn/no-array-sort -- sorting a fresh copy; nothing else observes it.
	].sort(byYearDesc);

	return (
		<div className="marquee-container page-transition space-y-8 py-8">
			<section aria-label={person.name} className="space-y-6">
				<div className="flex flex-col gap-6 sm:flex-row">
					<div className="w-40 shrink-0 sm:w-52">
						{profile ? (
							<img
								alt={person.name}
								className="poster w-full"
								src={profile}
							/>
						) : (
							<div className="bg-muted poster flex items-center justify-center p-3 text-center">
								<span className="font-heading text-muted-foreground text-lg leading-tight">
									{person.name}
								</span>
							</div>
						)}
					</div>
					<div className="min-w-0 flex-1 space-y-3">
						<h1 className="font-heading text-foreground text-3xl sm:text-4xl">
							{person.name}
						</h1>
						<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
							{person.knownForDepartment && (
								<span>{person.knownForDepartment}</span>
							)}
							{lifespan && <span>{lifespan}</span>}
							{person.placeOfBirth && <span>{person.placeOfBirth}</span>}
						</div>
						{person.biography && (
							<p className="max-w-3xl whitespace-pre-line">{person.biography}</p>
						)}
					</div>
				</div>
			</section>

			{cast.length > 0 && (
				<section aria-label="Acting credits" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">Acting</h2>
					<MediaGrid items={cast} />
				</section>
			)}

			{crew.length > 0 && (
				<section aria-label="Crew credits" className="space-y-3">
					<h2 className="font-heading text-foreground text-xl">Crew</h2>
					<MediaGrid items={crew} />
				</section>
			)}
		</div>
	);
}
