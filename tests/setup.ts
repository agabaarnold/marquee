import "@testing-library/jest-dom/vitest";

// Server env is parsed at module import time; provide dummy values so unit
// tests (MSW intercepts all HTTP) never touch real credentials.
process.env.API_KEY ??= "test-api-key";
process.env.API_READ_ACCESS_TOKEN ??= "test-read-access-token";
process.env.TMDB_BASE_URL ??= "https://api.themoviedb.org/3";
process.env.NODE_ENV ??= "development";
