import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
	server: {
		API_KEY: z.string(),
		API_READ_ACCESS_TOKEN: z.string(),
		TMDB_BASE_URL: z.url(),
		NODE_ENV: z.enum(["development", "production"]).default("development"),
	},
	runtimeEnv: process.env,
});
