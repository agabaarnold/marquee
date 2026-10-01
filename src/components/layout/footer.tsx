import { Link } from "@tanstack/react-router";

import { Logo } from "#/components/brand/logo.tsx";

const BROWSE: { label: string; href: string }[] = [
	{ label: "Movies", href: "/movies" },
	{ label: "TV", href: "/tv" },
	{ label: "Discover", href: "/discover" },
	{ label: "Search", href: "/search" },
	{ label: "Watchlist", href: "/watchlist" },
];

const PROJECT: { label: string; href: string }[] = [
	{ label: "About", href: "/about" },
];

const YEAR = new Date().getFullYear();

const Footer = () => (
	<footer className="border-border border-t">
		<div className="marquee-container flex flex-col gap-8 py-10 md:flex-row md:justify-between">
			<div className="max-w-xs space-y-3">
				<Logo />
				<p className="text-muted-foreground text-sm">Everything on screen.</p>
			</div>

			{/* NOTE: hrefs stay general strings until the routes exist; then narrow to typed to. */}
			<nav aria-label="Browse">
				<ul className="space-y-2">
					{BROWSE.map((item) => (
						<li key={item.href}>
							<Link
								className="text-muted-foreground hover:text-foreground text-sm"
								to={item.href}
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<nav aria-label="Project">
				<ul className="space-y-2">
					{PROJECT.map((item) => (
						<li key={item.href}>
							<Link
								className="text-muted-foreground hover:text-foreground text-sm"
								to={item.href}
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>

		<div className="border-border border-t">
			<div className="marquee-container flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center">
				<img
					alt="The Movie Database"
					className="h-5 w-auto"
					src="/tmdb-logo.svg"
				/>
				<p className="text-muted-foreground">
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
				<p className="text-muted-foreground sm:ml-auto">
					© {YEAR} Marquee · A personal, non-commercial project.
				</p>
			</div>
		</div>
	</footer>
);

export default Footer;
