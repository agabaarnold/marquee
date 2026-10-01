import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const STORAGE_KEY = "marquee:theme";
const DEFAULT_THEME: Theme = "system";

export const parseTheme = (raw: string | null): Theme =>
	raw === "light" || raw === "dark" || raw === "system" ? raw : DEFAULT_THEME;

const readStored = (): Theme => {
	if (typeof window === "undefined") {
		return DEFAULT_THEME;
	}
	try {
		return parseTheme(window.localStorage.getItem(STORAGE_KEY));
	} catch {
		// Private browsing can throw on access; fall back silently.
		return DEFAULT_THEME;
	}
};

/** Client-only read of the stored choice (defaults to "system"). */
export const getStoredTheme = (): Theme => readStored();

export const resolveTheme = (theme: Theme): ResolvedTheme => {
	if (theme !== "system") {
		return theme;
	}
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
};

/** Keep data-theme (design tokens) and .dark (Tailwind dark: variant) in sync. */
export const applyTheme = (resolved: ResolvedTheme): void => {
	const root = document.documentElement;
	root.dataset.theme = resolved;
	root.classList.toggle("dark", resolved === "dark");
};

let snapshot: Theme | null = null;
const listeners = new Set<() => void>();

const getSnapshot = (): Theme => {
	if (snapshot === null) {
		snapshot = readStored();
	}
	return snapshot;
};

const getServerSnapshot = (): Theme => DEFAULT_THEME;

const subscribe = (listener: () => void): (() => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

const notify = (): void => {
	for (const listener of listeners) {
		listener();
	}
};

export const setThemeState = (theme: Theme): void => {
	snapshot = theme;
	notify();
};

export const setTheme = (theme: Theme): void => {
	try {
		window.localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// Private browsing can throw on write; the choice still applies in memory.
	}
	applyTheme(resolveTheme(theme));
	setThemeState(theme);
};

export interface ThemeState {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

export const useTheme = (): ThemeState => {
	const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	return { setTheme, theme };
};

/** Applies the stored/OS theme and keeps it applied across OS and tab changes. */
export const useThemeLifecycle = (): void => {
	useEffect(() => {
		// Re-apply on mount in case the pre-paint script didn't run.
		applyTheme(resolveTheme(getStoredTheme()));
		const media = window.matchMedia("(prefers-color-scheme: light)");
		const onMediaChange = (): void => {
			applyTheme(resolveTheme(getStoredTheme()));
		};
		const onStorage = (event: StorageEvent): void => {
			if (event.key === STORAGE_KEY && event.newValue !== null) {
				const next = parseTheme(event.newValue);
				applyTheme(resolveTheme(next));
				setThemeState(next);
			}
		};
		media.addEventListener("change", onMediaChange);
		window.addEventListener("storage", onStorage);
		return () => {
			media.removeEventListener("change", onMediaChange);
			window.removeEventListener("storage", onStorage);
		};
	}, []);
};
