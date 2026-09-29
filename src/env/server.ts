import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
	server: { API_KEY: z.string(), API_READ_ACCESS_TOKEN: z.string() },
	runtimeEnv: process.env,
});
