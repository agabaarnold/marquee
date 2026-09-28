// oxlint-disable jsx-a11y/prefer-tag-over-role shadcn/no-raw-colors
import { cn } from "cn";

const top = ["#FFB020", "#3DD6C6", "#FFB020", "#3DD6C6", "#FFB020"];
const bottom = ["#3DD6C6", "#FFB020", "#3DD6C6", "#FFB020", "#3DD6C6"];

/** The Marquee mark: dark tile, alternating amber (movie) / teal (series) bulbs, and an "M"
 *  whose centre notch reads as a play chevron. The tile is intentionally dark in both themes.
 */
export const LogoMark = ({
	className,
	title = "Marquee",
}: {
	className?: string;
	title?: string;
}) => (
	<svg
		viewBox="0 0 64 64"
		role="img"
		aria-label={title}
		className={cn("size-8 shrink-0", className)}
	>
		<rect width="64" height="64" rx="15" fill="#0B0B10" />
		<rect
			x="1.5"
			y="1.5"
			width="61"
			height="61"
			rx="13.5"
			fill="none"
			stroke="#2A2A38"
			strokeWidth="1.5"
		/>
		{top.map((c, i) => (
			<circle key={`t${i}`} cx={14 + i * 9} cy="11" r="2.4" fill={c} />
		))}
		{bottom.map((c, i) => (
			<circle key={`b${i}`} cx={14 + i * 9} cy="53" r="2.4" fill={c} />
		))}
		<path
			d="M16 43V21l16 14 16-14v22"
			fill="none"
			stroke="#F2F1EC"
			strokeWidth="5.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/** Header/footer lockup. Text inherits colour so it works in light and dark themes. */
export const Logo = ({
	className,
	showWordmark = true,
}: {
	className?: string;
	showWordmark?: boolean;
}) => (
	<span className={cn("inline-flex items-center gap-2.5", className)}>
		<LogoMark />

		{showWordmark && (
			<span className="font-heading text-foreground text-2xl leading-none tracking-tight">
				Marquee
			</span>
		)}
	</span>
);
