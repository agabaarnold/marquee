// oxlint-disable shadcn/no-arbitrary-values
// oxlint-disable jsx-a11y/prefer-tag-over-role -- labelled graphic with no image source: role="img" plus an accessible name is the correct pattern; an <img> would require a src.
import { cn } from "cn";

const SIZE_CLASS = { sm: "size-8", md: "size-11", lg: "size-14" } as const;

export const RatingRing = ({
	value,
	votes,
	size = "md",
	className,
}: {
	/** 0–10, as returned by TMDB's vote_average. */
	value: number;
	votes?: number;
	size?: keyof typeof SIZE_CLASS;
	className?: string;
}) => {
	// Guard against non-finite input: NaN would poison the gradient and label.
	const safeValue = Number.isFinite(value) ? value : 0;
	const pct = Math.max(0, Math.min(100, Math.round(safeValue * 10)));
	// A zero or missing vote count carries no information, so both omit it.
	const label = votes
		? `${safeValue.toFixed(1)} out of 10, ${votes.toLocaleString()} votes`
		: `${safeValue.toFixed(1)} out of 10`;

	return (
		<div
			aria-label={label}
			className={cn(
				"relative inline-flex shrink-0 items-center justify-center rounded-full",
				SIZE_CLASS[size],
				className
			)}
			role="img"
			style={{
				// oxlint-disable-next-line shadcn/no-inline-styles -- the conic-gradient fill percentage is computed per rating and can't be expressed as a static Tailwind class.
				background: `conic-gradient(var(--accent) ${pct}%, var(--border) 0)`,
			}}
		>
			<div
				aria-hidden="true"
				className="bg-card text-foreground absolute inset-0.5 flex items-center justify-center rounded-full text-[10px] font-semibold tabular-nums"
			>
				{safeValue > 0 ? safeValue.toFixed(1) : "—"}
			</div>
		</div>
	);
};
