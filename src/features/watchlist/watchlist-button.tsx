import { Bookmark, BookmarkCheck } from "lucide-react";
import type { MouseEvent } from "react";

import type { MediaSummary } from "#/types/media.ts";

import { toggleSaved, useWatchlist } from "./store";

type WatchlistMedia = Pick<
	MediaSummary,
	"mediaType" | "id" | "title" | "posterPath" | "year"
>;

const onToggle = (event: MouseEvent, media: WatchlistMedia): void => {
	// Safe inside card links: never follow the ancestor anchor.
	event.preventDefault();
	event.stopPropagation();
	toggleSaved(media);
};

export const WatchlistButton = ({
	media,
	variant = "icon",
	className,
}: {
	media: WatchlistMedia;
	variant?: "icon" | "full";
	className?: string;
}) => {
	const { isSaved } = useWatchlist();
	const saved = isSaved(media.mediaType, media.id);
	const label = saved
		? `Remove ${media.title} from watchlist`
		: `Save ${media.title} to watchlist`;
	const Icon = saved ? BookmarkCheck : Bookmark;

	if (variant === "full") {
		return (
			<button
				aria-pressed={saved}
				className={className}
				onClick={(event) => {
					onToggle(event, media);
				}}
				type="button"
			>
				<Icon aria-hidden="true" className="size-4" />
				{saved ? "Saved" : "Watchlist"}
			</button>
		);
	}

	return (
		<button
			aria-label={label}
			aria-pressed={saved}
			className={className}
			onClick={(event) => {
				onToggle(event, media);
			}}
			type="button"
		>
			<Icon aria-hidden="true" className="size-4" />
		</button>
	);
};
