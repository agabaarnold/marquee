import { Link } from "@tanstack/react-router";

import {
	segmentedControlItemVariants,
	segmentedControlRootClassName,
} from "#/lib/segmented-control.ts";
import type { TimeWindow } from "#/schemas/common.ts";

const TYPE_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "movie", label: "Movies" },
	{ value: "tv", label: "TV" },
] as const;

export const TrendingToggles = ({
	window,
	trending,
}: {
	window: TimeWindow;
	trending: "all" | "movie" | "tv";
}) => (
	<div className="flex flex-wrap gap-3">
		<fieldset className={segmentedControlRootClassName}>
			<legend className="sr-only">Time window</legend>
			<Link
				aria-current={window === "day" ? "page" : undefined}
				className={segmentedControlItemVariants(
					window === "day" ? { state: "current" } : {}
				)}
				from="/"
				search={(previous) => ({ ...previous, window: "day" })}
			>
				Today
			</Link>
			<Link
				aria-current={window === "week" ? "page" : undefined}
				className={segmentedControlItemVariants(
					window === "week" ? { state: "current" } : {}
				)}
				from="/"
				search={(previous) => ({ ...previous, window: "week" })}
			>
				This week
			</Link>
		</fieldset>
		<fieldset className={segmentedControlRootClassName}>
			<legend className="sr-only">Media type</legend>
			{TYPE_OPTIONS.map((option) => (
				<Link
					key={option.value}
					aria-current={trending === option.value ? "page" : undefined}
					className={segmentedControlItemVariants(
						trending === option.value ? { state: "current" } : {}
					)}
					from="/"
					search={(previous) => ({ ...previous, trending: option.value })}
				>
					{option.label}
				</Link>
			))}
		</fieldset>
	</div>
);
