import { useSyncExternalStore } from "react";

import type { MediaType } from "#/schemas/common.ts";
import type { WatchlistItem } from "#/schemas/watchlist.ts";
import { WatchlistState } from "#/schemas/watchlist.ts";

const STORAGE_KEY = "marquee:watchlist:v1";
const BACKUP_KEY = "marquee:watchlist:backup";

export type WatchlistInput = Pick<
	WatchlistItem,
	"mediaType" | "id" | "title" | "posterPath" | "year"
>;

export interface Watchlist {
	items: WatchlistItem[];
	count: number;
	isSaved: (mediaType: MediaType, id: number) => boolean;
	toggle: (input: WatchlistInput) => void;
	remove: (mediaType: MediaType, id: number) => void;
	setStatus: (
		mediaType: MediaType,
		id: number,
		status: WatchlistItem["status"]
	) => void;
}

interface StoredState {
	version: 1;
	items: WatchlistItem[];
}

const emptyState = (): StoredState => ({ items: [], version: 1 });

// Shared frozen snapshot for SSR: React requires getServerSnapshot to
// return a cached value, otherwise hydration loops forever.
const SERVER_SNAPSHOT: StoredState = { items: [], version: 1 };

const readStored = (): StoredState => {
	if (typeof window === "undefined") {
		return emptyState();
	}
	let raw: string | null = null;
	try {
		raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return emptyState();
		}
		const parsed: unknown = JSON.parse(raw);
		const result = WatchlistState.safeParse(parsed);
		if (!result.success) {
			throw new Error("Invalid watchlist data");
		}
		return result.data;
	} catch {
		if (raw) {
			try {
				window.localStorage.setItem(BACKUP_KEY, raw);
			} catch {
				// Backup failing must not block starting clean.
			}
		}
		return emptyState();
	}
};

const persist = (state: StoredState): void => {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Quota or private mode: keep the in-memory state.
	}
};

let snapshot: StoredState | null = null;
const listeners = new Set<() => void>();

const getSnapshot = (): StoredState => {
	if (snapshot === null) {
		snapshot = readStored();
	}
	return snapshot;
};

const getServerSnapshot = (): StoredState => SERVER_SNAPSHOT;

const subscribe = (listener: () => void): (() => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

const commit = (next: StoredState): void => {
	snapshot = next;
	persist(next);
	for (const listener of listeners) {
		listener();
	}
};

const matches = (
	item: WatchlistItem,
	mediaType: MediaType,
	id: number
): boolean => item.mediaType === mediaType && item.id === id;

export const isSaved = (mediaType: MediaType, id: number): boolean =>
	getSnapshot().items.some((item) => matches(item, mediaType, id));

export const toggleSaved = (input: WatchlistInput): void => {
	const state = getSnapshot();
	if (isSaved(input.mediaType, input.id)) {
		commit({
			...state,
			items: state.items.filter(
				(item) => !matches(item, input.mediaType, input.id)
			),
		});
		return;
	}
	commit({
		...state,
		items: [
			...state.items,
			{
				mediaType: input.mediaType,
				id: input.id,
				title: input.title,
				posterPath: input.posterPath,
				year: input.year,
				addedAt: new Date().toISOString(),
				status: "planned",
			},
		],
	});
};

export const removeSaved = (mediaType: MediaType, id: number): void => {
	const state = getSnapshot();
	commit({
		...state,
		items: state.items.filter((item) => !matches(item, mediaType, id)),
	});
};

export const setSavedStatus = (
	mediaType: MediaType,
	id: number,
	status: WatchlistItem["status"]
): void => {
	const state = getSnapshot();
	commit({
		...state,
		items: state.items.map((item) =>
			matches(item, mediaType, id) ? { ...item, status } : item
		),
	});
};

if (typeof window !== "undefined") {
	window.addEventListener("storage", (event) => {
		if (event.key === STORAGE_KEY) {
			snapshot = readStored();
			for (const listener of listeners) {
				listener();
			}
		}
	});
}

export const useWatchlist = (): Watchlist => {
	const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	return {
		count: state.items.length,
		isSaved,
		items: state.items,
		remove: removeSaved,
		setStatus: setSavedStatus,
		toggle: toggleSaved,
	};
};
