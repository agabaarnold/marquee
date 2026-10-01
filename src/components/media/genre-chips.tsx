import { Link } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge.tsx";
import type { Genre, MediaType } from "#/schemas/common.ts";

export const GenreChips = ({
	genres,
	mediaType,
	limit,
	linked = true,
}: {
	genres: Genre[];
	mediaType: MediaType;
	limit?: number;
	/** Set false to render plain, non-interactive chips (e.g. inside another link). */
	linked?: boolean;
}) => {
	const shown = limit === undefined ? genres : genres.slice(0, limit);
	if (shown.length === 0) {
		return null;
	}

	return (
		<ul className="flex flex-wrap gap-1.5">
			{shown.map((genre) => {
				// oxlint-disable-next-line typescript/no-inferrable-types -- widened on purpose: the route doesn't exist yet, keeping Link's to typechecked as an unchecked string.
				const pathname: string = "/discover";
				return linked ? (
					<li key={genre.id}>
						<Badge
							render={
								<Link
									// @ts-expect-error -- /discover isn't registered yet, so its search params aren't in the router's closed search union; remove this once the route lands (it will then error as unused).
									search={{ genres: [genre.id], type: mediaType }}
									to={pathname}
								>
									{genre.name}
								</Link>
							}
							variant="outline"
						/>
					</li>
				) : (
					<li key={genre.id}>
						<Badge variant="outline">{genre.name}</Badge>
					</li>
				);
			})}
		</ul>
	);
};
