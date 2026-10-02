// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import { Logo } from "#/components/brand/logo.tsx";

const STACK = [
	"TanStack Start, Router, Query",
	"axios (server-only API client)",
	"zod-validated TMDB responses",
	"shadcn/ui on Base UI",
	"Tailwind CSS v4",
] as const;

export const Route = createFileRoute("/about")({
	component: AboutPage,
	head: () => ({
		meta: [
			{ title: "About · Marquee" },
			{
				name: "description",
				content:
					"About Marquee and attribution for the TMDB API powering its data.",
			},
		],
	}),
});

function AboutPage() {
	return (
		<div className="marquee-container page-transition max-w-3xl space-y-8 py-8">
			<div className="space-y-3">
				<Logo />
				<h1 className="font-heading text-foreground text-3xl">
					Everything on screen.
				</h1>
				<p className="text-muted-foreground">
					Marquee is a fast, cinematic discovery site for movies and TV series:
					browse what&apos;s trending, explore by genre and filters, read rich
					detail pages, search everything, and keep a local watchlist. It is a
					personal, non-commercial project.
				</p>
			</div>

			<section aria-label="Data attribution" className="space-y-3">
				<h2 className="font-heading text-foreground text-xl">Data</h2>
				<div className="flex items-center gap-3">
					<img
						alt="The Movie Database"
						className="h-6 w-auto"
						src="/tmdb-logo.svg"
					/>
				</div>
				<p className="text-muted-foreground text-sm">
					This product uses the TMDB API but is not endorsed or certified by
					TMDB.{" "}
					<a
						className="underline underline-offset-2"
						href="https://www.themoviedb.org"
						rel="noopener noreferrer"
						target="_blank"
					>
						themoviedb.org
					</a>
				</p>
			</section>

			<section aria-label="Technology" className="space-y-3">
				<h2 className="font-heading text-foreground text-xl">Built with</h2>
				<ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
					{STACK.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</section>
		</div>
	);
}
