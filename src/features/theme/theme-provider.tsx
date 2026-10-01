import { useEffect } from "react";
import type { ReactNode } from "react";

import {
	applyTheme,
	getStoredTheme,
	parseTheme,
	resolveTheme,
	setThemeState,
	STORAGE_KEY,
} from "./store";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
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

	return children;
};
};
