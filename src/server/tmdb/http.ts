import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { create, isAxiosError } from "axios";
import { z } from "zod";

import { serverEnv } from "#/env/server.ts";

import {
	TmdbAuthError,
	TmdbNotFoundError,
	TmdbRateLimitError,
	TmdbSchemaError,
	TmdbUnknownError,
} from "../errors";

const REQUEST_TIMEOUT_MS = 8000;
const RETRY_LIMIT = 2;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

/**
 * axios's default param serializer turns arrays into `genres[]=28&genres[]=12`.
 * TMDB wants `with_genres=28,12`, and drops empty/undefined values instead of
 * sending them as the literal string "undefined".
 */
// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type
const serializeParams = (params: Record<string, unknown>): string => {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") {
			continue;
		}
		search.set(key, Array.isArray(value) ? value.join(",") : String(value));
	}

	return search.toString();
};

const sleep = (ms: number): Promise<void> =>
	// oxlint-disable-next-line no-promise-executor-return promise/avoid-new
	new Promise((resolve) => setTimeout(resolve, ms));

export const tmdbHttp: AxiosInstance = create({
	baseURL: serverEnv.TMDB_BASE_URL,
	timeout: REQUEST_TIMEOUT_MS,
	// TMDB's API never redirects; refuse it rather than follow one silently
	maxRedirects: 0,
	headers: {
		Accept: "application/json",
		Authorization: `Bearer ${serverEnv.API_READ_ACCESS_TOKEN}`,
	},
	paramsSerializer: { serialize: serializeParams },
	validateStatus: (status) => status >= 200 && status < 300,
});

if (serverEnv.NODE_ENV !== "production") {
	tmdbHttp.interceptors.request.use((config) => {
		console.info(`[tmdb] → ${config.method?.toUpperCase()} ${config.url}`);
		return config;
	});
}

const retryDelayMs = (attempt: number, error: AxiosError): number => {
	const retryAfter = Number(error.response?.headers?.["retry-after"]);
	if (Number.isFinite(retryAfter) && retryAfter > 0) {
		return retryAfter * 1000;
	}

	// 300ms, 600ms, 1200ms…
	return 300 * 2 ** attempt;
};

const isRetryable = (error: unknown): error is AxiosError => {
	if (!isAxiosError(error)) {
		return false;
	}

	if (!error.response) {
		// network error / timeout — safe to retry an idempotent GET
		return true;
	}

	return RETRYABLE_STATUS.has(error.response.status);
};

const requestWithRetry = async <T>(config: AxiosRequestConfig): Promise<T> => {
	let lastError: unknown;

	for (let attempt = 0; attempt <= RETRY_LIMIT; attempt += 1) {
		try {
			// oxlint-disable-next-line no-await-in-loop -- retry loop: attempt N+1 runs only if attempt N failed, so requests must stay sequential.
			const response = await tmdbHttp.request<T>(config);
			return response.data;
		} catch (error) {
			lastError = error;
			if (attempt === RETRY_LIMIT || !isRetryable(error)) {
				throw error;
			}
			// oxlint-disable-next-line no-await-in-loop -- backoff sleep must complete before the next sequential attempt.
			await sleep(retryDelayMs(attempt, error));
		}
	}

	// Unreachable — the final loop iteration always throws — kept to satisfy TS's control-flow analysis.
	throw lastError;
};

// oxlint-disable-next-line anti-slop/no-unknown-parameters
const toTmdbError = (error: unknown, path: string): Error => {
	if (!isAxiosError(error)) {
		return error instanceof Error
			? error
			: new TmdbUnknownError(path, String(error));
	}
	// SAFETY: never forward the raw AxiosError — its config carries the Authorization header.
	const status = error.response?.status;
	if (status === 401) {
		return new TmdbAuthError(path);
	}
	if (status === 404) {
		return new TmdbNotFoundError(path);
	}
	if (status === 429) {
		return new TmdbRateLimitError(path);
	}
	return new TmdbUnknownError(path, error.message);
};

export interface TmdbGetOptions {
	params?: Record<
		string,
		string | number | boolean | number[] | string[] | undefined
	>;
	/** Forward a server function's AbortSignal so a cancelled TanStack Query request cancels the upstream fetch too. */
	signal?: AbortSignal;
}

/**
 * GET a TMDB endpoint and validate the response against `schema`.
 *
 * @param path   e.g. "/movie/550" (no base URL, no query string)
 * @param schema parsed with `safeParse`; a mismatch throws `TmdbSchemaError`
 *               with the input left as `unknown`, TMDB's occasional `null`s
 *               and `""`s can't silently become the wrong type downstream.
 */
export const tmdbGet = async <S extends z.ZodType>(
	path: string,
	schema: S,
	{ params = {}, signal }: TmdbGetOptions = {}
): Promise<z.output<S>> => {
	let raw: unknown;
	try {
		raw = await requestWithRetry<unknown>({
			url: path,
			method: "GET",
			params: { language: "en-US", ...params },
			signal,
		});
	} catch (error) {
		throw toTmdbError(error, path);
	}

	const parsed = schema.safeParse(raw);
	if (!parsed.success) {
		throw new TmdbSchemaError(path, z.prettifyError(parsed.error));
	}

	return parsed.data;
};
