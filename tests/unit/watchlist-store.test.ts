// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WatchlistInput } from "#/features/watchlist/store.ts";

const loadStore = () => import("#/features/watchlist/store.ts");

const item: WatchlistInput = {
	mediaType: "movie",
	id: 550,
	title: "Fight Club",
	posterPath: "/p.jpg",
	year: 1999,
};

beforeEach(async () => {
	vi.resetModules();
	window.localStorage.clear();
	await loadStore();
});

describe("watchlist store", () => {
	it("toggles an item with planned status and an ISO timestamp", async () => {
		const store = await loadStore();
		expect(store.isSaved("movie", 550)).toBe(false);
		store.toggleSaved(item);
		expect(store.isSaved("movie", 550)).toBe(true);
		const raw = window.localStorage.getItem("marquee:watchlist:v1");
		expect(JSON.parse(raw ?? "{}").items[0]).toMatchObject({
			status: "planned",
			title: "Fight Club",
		});
	});

	it("stores defaults and removes on second toggle", async () => {
		const store = await loadStore();
		store.toggleSaved(item);
		const { result } = renderHook(() => store.useWatchlist());
		expect(result.current.items).toHaveLength(1);
		expect(result.current.items[0]).toMatchObject({
			status: "planned",
			title: "Fight Club",
		});
		expect(result.current.items[0]?.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/u);

		act(() => {
			result.current.toggle(item);
		});
		expect(result.current.items).toHaveLength(0);
	});

	it("isolates movie and tv ids and updates status", async () => {
		const store = await loadStore();
		store.toggleSaved(item);
		store.toggleSaved({ ...item, mediaType: "tv" });
		const { result } = renderHook(() => store.useWatchlist());
		expect(result.current.count).toBe(2);

		act(() => {
			result.current.setStatus("movie", 550, "watched");
		});
		expect(
			result.current.items.find((entry) => entry.mediaType === "movie")?.status
		).toBe("watched");

		act(() => {
			result.current.remove("movie", 550);
		});
		expect(result.current.items).toHaveLength(1);
	});

	it("backs up corrupt data and starts clean", async () => {
		window.localStorage.setItem("marquee:watchlist:v1", "not-json{{{");
		const store = await loadStore();
		const { result } = renderHook(() => store.useWatchlist());
		expect(result.current.items).toEqual([]);
		expect(window.localStorage.getItem("marquee:watchlist:backup")).toBe(
			"not-json{{{"
		);
	});

	it("rejects schema-invalid data", async () => {
		window.localStorage.setItem(
			"marquee:watchlist:v1",
			JSON.stringify({ version: 1, items: [{ id: "bad" }] })
		);
		const store = await loadStore();
		const { result } = renderHook(() => store.useWatchlist());
		expect(result.current.items).toEqual([]);
	});

	it("syncs across tabs via storage events", async () => {
		const store = await loadStore();
		const { result } = renderHook(() => store.useWatchlist());
		expect(result.current.count).toBe(0);
		window.localStorage.setItem(
			"marquee:watchlist:v1",
			JSON.stringify({
				version: 1,
				items: [
					{
						...item,
						addedAt: new Date().toISOString(),
						status: "planned",
					},
				],
			})
		);
		act(() => {
			window.dispatchEvent(
				new StorageEvent("storage", { key: "marquee:watchlist:v1" })
			);
		});
		expect(result.current.count).toBe(1);
	});
});
