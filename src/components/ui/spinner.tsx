import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import type React from "react";

export const Spinner = ({
	className,
	...props
}: React.ComponentProps<typeof Loader2Icon>): React.ReactElement => (
	<Loader2Icon
		aria-label="Loading"
		className={cn("animate-spin", className)}
		// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Loader2Icon renders an svg; role=status with an accessible name is the correct loading-indicator pattern here.
		role="status"
		{...props}
	/>
);
