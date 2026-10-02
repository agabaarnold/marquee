import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without globals:true, RTL auto-cleanup never installs; without this,
// renders accumulate across tests in a file and role queries go ambiguous.
afterEach(() => {
	cleanup();
});

// jsdom has no matchMedia; components reading the OS theme need a stub.
// Skipped entirely under node (server-side test files).
const noop = (): void => undefined;

const matchMediaStub = () => ({
	matches: false,
	media: "",
	addEventListener: noop,
	removeEventListener: noop,
	addListener: noop,
	removeListener: noop,
	dispatchEvent: () => false,
	onchange: null,
});

if (typeof window !== "undefined") {
	Object.defineProperty(window, "matchMedia", {
		value: matchMediaStub,
		writable: true,
	});
}

// Server env is parsed at module import time, and neither .env.local
// (possibly empty values) nor Vitest's NODE_ENV=test satisfy its schema,
// so force dummy values. MSW intercepts all HTTP in these tests.
process.env.API_KEY = "test-api-key";
process.env.API_READ_ACCESS_TOKEN = "test-read-access-token";
process.env.TMDB_BASE_URL = "https://api.themoviedb.org/3";
process.env.NODE_ENV = "development";
