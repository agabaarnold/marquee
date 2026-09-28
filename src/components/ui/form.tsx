"use client";

// oxlint-disable-next-line unicorn/prefer-export-from
import { Form as FormPrimitive } from "@base-ui/react/form";
import type React from "react";

export const Form = ({
	className,
	...props
}: FormPrimitive.Props): React.ReactElement => (
	<FormPrimitive className={className} data-slot="form" {...props} />
);

export { FormPrimitive };
