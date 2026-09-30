import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { TmdbNotFoundError } from "../errors";
import { person } from "../tmdb/endpoints";

export const getPerson = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => {
		try {
			return await person(data.id);
		} catch (error) {
			if (error instanceof TmdbNotFoundError) {
				throw notFound();
			}
			throw error;
		}
	});
