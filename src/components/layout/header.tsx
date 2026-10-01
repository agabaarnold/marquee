// oxlint-disable github/a11y-no-visually-hidden-interactive-element -- skip link: intentionally hidden until focused, the standard accessible pattern; focus:not-sr-only reveals it to sighted keyboard users.
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Logo } from "#/components/brand/logo.tsx";

const NAV: { label: string; href: string }[] = [
	{ label: "Movies", href: "/movies" },
	{ label: "TV", href: "/tv" },
	{ label: "Discover", href: "/discover" },
];
// oxlint-disable-next-line typescript/no-inferrable-types -- widened on purpose: the route doesn't exist yet, keeping Link's to typechecked as an unchecked string.
const SEARCH_HREF: string = "/search";

const Header = () => (
	<header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur">
		<a
			className="focus:bg-background sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:px-3 focus:py-2"
			href="#main-content"
		>
			Skip to content
		</a>
		<div className="marquee-container flex h-16 items-center gap-6">
			<Link aria-label="Marquee home" to="/">
				<Logo />
			</Link>

			{/* NOTE: hrefs stay general strings until the hub routes exist; then narrow to typed to + search. */}
			<nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
				{NAV.map((item) => (
					<Link
						activeOptions={{ exact: false, includeSearch: false }}
						activeProps={{
							"aria-current": "page",
							className: "text-foreground",
						}}
						className="text-muted-foreground hover:text-foreground rounded px-3 py-2 text-sm font-medium"
						key={item.href}
						to={item.href}
					>
						{item.label}
					</Link>
				))}
			</nav>

			<div className="ml-auto flex items-center gap-2">
				{/* NOTE: string href until /search and the command palette exist. */}
				<Link
					className="text-muted-foreground hover:text-foreground border-border flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
					to={SEARCH_HREF}
				>
					<Search aria-hidden="true" className="size-4" />
					<span className="hidden sm:inline">Search…</span>
					<kbd className="border-border hidden rounded border px-1 text-xs sm:inline">
						⌘K
					</kbd>
				</Link>

				{/* NOTE: theme toggle mounts here once features/theme lands. */}
				{/* NOTE: watchlist count mounts here once features/watchlist lands. */}
			</div>
		</div>
	</header>
);

export default Header;
