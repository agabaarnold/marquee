import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia; components reading the OS theme need a stub.
const matchMediaStub = (matches: boolean) => ({
	matches,
	media: "",
	addEventListener: () => {},
	removeEventListener: () => {},
	addListener: () => {},
	removeListener: () => {},
	dispatchEvent: () => false,
	onchange: null,
});
Object.defineProperty(window, "matchMedia", {
	value: () => matchMediaStub(false),
	writable: true,
});

// Server env is parsed at module import time, and neither .env.local
// (possibly empty values) nor Vitest's NODE_ENV=test satisfy its schema,
// so force dummy values. MSW intercepts all HTTP in these tests.
process.env.API_KEY = "test-api-key";
process.env.API_READ_ACCESS_TOKEN = "test-read-access-token";
process.env.TMDB_BASE_URL = "https://api.themoviedb.org/3";
process.env.NODE_ENV = "development";
