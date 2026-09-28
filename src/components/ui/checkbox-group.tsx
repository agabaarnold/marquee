// oxlint-disable-next-line unicorn/prefer-export-from
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import { cn } from "cn";
import type React from "react";

export const CheckboxGroup = ({
	className,
	...props
}: CheckboxGroupPrimitive.Props): React.ReactElement => (
	<CheckboxGroupPrimitive
		className={cn("flex flex-col items-start gap-3", className)}
		{...props}
	/>
);

export { CheckboxGroupPrimitive };
