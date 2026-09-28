"use client";

// oxlint-disable anti-slop/no-runtime-typeof -- `typeof` narrowing on the
// Breakpoint | number union and the `window` existence guard is the intended
// contract here; no I/O parsing layer applies.

import { useCallback, useSyncExternalStore } from "react";

const BREAKPOINTS = {
	"2xl": 1536,
	"3xl": 1600,
	"4xl": 2000,
	lg: 1024,
	md: 800,
	sm: 640,
	xl: 1280,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

type BreakpointQuery =
	| Breakpoint
	| `max-${Breakpoint}`
	| `${Breakpoint}:max-${Breakpoint}`;

// `{}` widens the union to any string while preserving literal autocomplete for
// the breakpoint shorthands.
// oxlint-disable-next-line typescript/ban-types
type FlexibleQuery = BreakpointQuery | MediaQueryInput | (string & {});

const resolveMin = (value: Breakpoint | number): string => {
	const px = typeof value === "number" ? value : BREAKPOINTS[value];
	return `(min-width: ${px}px)`;
};

const resolveMax = (value: Breakpoint | number): string => {
	const px = typeof value === "number" ? value : BREAKPOINTS[value];
	return `(max-width: ${px - 1}px)`;
};

const parseShorthandQuery = (query: string): string => {
	const parts: string[] = [];
	for (const segment of query.split(":")) {
		if (segment.startsWith("max-")) {
			const bp = segment.slice(4);
			if (bp in BREAKPOINTS) {
				// SAFETY: `bp in BREAKPOINTS` guarantees bp is a valid Breakpoint key.
				parts.push(resolveMax(bp as Breakpoint));
			}
		} else if (segment in BREAKPOINTS) {
			// SAFETY: `segment in BREAKPOINTS` guarantees segment is a valid Breakpoint key.
			parts.push(resolveMin(segment as Breakpoint));
		}
	}

	return parts.length > 0 ? parts.join(" and ") : query;
};

const parseQuery = (query: FlexibleQuery): string => {
	if (typeof query !== "string") {
		const parts: string[] = [];
		if (query.min !== undefined && query.min !== null) {
			parts.push(resolveMin(query.min));
		}
		if (query.max !== undefined && query.max !== null) {
			parts.push(resolveMax(query.max));
		}
		if (query.pointer === "coarse") {
			parts.push("(pointer: coarse)");
		}
		if (query.pointer === "fine") {
			parts.push("(pointer: fine)");
		}
		if (parts.length === 0) {
			return "(min-width: 0px)";
		}
		return parts.join(" and ");
	}

	if (query.startsWith("(")) {
		return query;
	}

	return parseShorthandQuery(query);
};

const getServerSnapshot = (): boolean => false;

export interface MediaQueryInput {
	min?: Breakpoint | number;
	max?: Breakpoint | number;
	/** Touch-like input (finger). Use "fine" for mouse/trackpad. */
	pointer?: "coarse" | "fine";
}

export const useMediaQuery = (query: FlexibleQuery): boolean => {
	const mediaQuery = parseQuery(query);

	const subscribe = useCallback(
		// oxlint-disable-next-line promise/prefer-await-to-callbacks -- useSyncExternalStore requires a subscribe callback; not a promise pattern.
		(callback: () => void) => {
			if (typeof window === "undefined") {
				return () => {
					// Server render: nothing was subscribed, nothing to clean up.
				};
			}
			const mql = window.matchMedia(mediaQuery);
			mql.addEventListener("change", callback);
			return () => mql.removeEventListener("change", callback);
		},
		[mediaQuery]
	);

	const getSnapshot = useCallback(() => {
		if (typeof window === "undefined") {
			return false;
		}
		return window.matchMedia(mediaQuery).matches;
	}, [mediaQuery]);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export const useIsMobile = (): boolean => useMediaQuery("max-md");
