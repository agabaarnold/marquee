import { Bookmark, BookmarkCheck } from "lucide-react";

import { toggleSaved, useWatchlist } from "./store";
import type { WatchlistInput } from "./store";

export const WatchlistButton = ({
	media,
	variant = "icon",
	className,
}: {
	media: WatchlistInput;
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
				onClick={() => {
					toggleSaved(media);
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
			onClick={() => {
				toggleSaved(media);
			}}
			type="button"
		>
			<Icon aria-hidden="true" className="size-4" />
		</button>
	);
};
