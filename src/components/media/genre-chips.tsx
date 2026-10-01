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
	const shown = limit ? genres.slice(0, limit) : genres;
	if (shown.length === 0) {
		return null;
	}

	return (
		<ul className="flex flex-wrap gap-1.5">
			{shown.map((genre) =>
				linked ? (
					<li key={genre.id}>
						{/* NOTE: swap for <Link to="/discover" search={{ type: mediaType, genres: [genre.id] }} />
						    once the /discover route exists. */}
						<Badge
							render={
								<a href={`/discover?type=${mediaType}&genres=${genre.id}`}>
									{genre.name}
								</a>
							}
							variant="outline"
						/>
					</li>
				) : (
					<li key={genre.id}>
						<Badge variant="outline">{genre.name}</Badge>
					</li>
				)
			)}
		</ul>
	);
};
