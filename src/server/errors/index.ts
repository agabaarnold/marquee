// oxlint-disable max-classes-per-file
export class TmdbHttpError extends Error {
	readonly path: string;

	constructor(path: string, message: string) {
		super(message);
		this.name = "TmdbHttpError";
		this.path = path;
	}
}

export class TmdbAuthError extends TmdbHttpError {
	constructor(path: string) {
		super(
			path,
			`TMDB rejected the request as unauthorized — check API_READ_ACCESS_TOKEN: ${path}`
		);
		this.name = "TmdbAuthError";
	}
}

export class TmdbNotFoundError extends TmdbHttpError {
	constructor(path: string) {
		super(path, `TMDB resource not found: ${path}`);
		this.name = "TmdbNotFoundError";
	}
}

export class TmdbRateLimitError extends TmdbHttpError {
	constructor(path: string) {
		super(path, `TMDB rate limit exceeded after retries: ${path}`);
		this.name = "TmdbRateLimitError";
	}
}

export class TmdbSchemaError extends TmdbHttpError {
	constructor(path: string, details: string) {
		super(
			path,
			`TMDB response for ${path} did not match the expected schema:\n${details}`
		);
		this.name = "TmdbSchemaError";
	}
}

export class TmdbUnknownError extends TmdbHttpError {
	constructor(path: string, message: string) {
		super(path, `Unexpected TMDB error for ${path}: ${message}`);
		this.name = "TmdbUnknownError";
	}
}

export class TmdbInvalidPathError extends TmdbHttpError {
	constructor(path: string) {
		super(
			path,
			`Refusing to send the TMDB credential to a non-TMDB target — pass a relative API path starting with "/": ${path}`
		);
		this.name = "TmdbInvalidPathError";
	}
}
