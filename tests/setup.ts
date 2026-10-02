import "@testing-library/jest-dom/vitest";

// Server env is parsed at module import time, and neither .env.local
// (possibly empty values) nor Vitest's NODE_ENV=test satisfy its schema,
// so force dummy values. MSW intercepts all HTTP in these tests.
process.env.API_KEY = "test-api-key";
process.env.API_READ_ACCESS_TOKEN = "test-read-access-token";
process.env.TMDB_BASE_URL = "https://api.themoviedb.org/3";
process.env.NODE_ENV = "development";
