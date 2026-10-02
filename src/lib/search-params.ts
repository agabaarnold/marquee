// Mirrors TanStack Router's default search codec so hand-built hrefs
// round-trip through validateSearch exactly like Link-built ones:
// objects/arrays are JSON-encoded, and strings that would JSON-parse
// on read (e.g. "2024") are quoted.
export type SearchParamValue =
	| string
	| number
	| boolean
	| number[]
	| string[]
	| undefined;

const encodeValue = (value: Exclude<SearchParamValue, undefined>): string => {
	if (typeof value === "object") {
		return JSON.stringify(value);
	}
	if (typeof value === "string") {
		try {
			JSON.parse(value);
			return JSON.stringify(value);
		} catch {
			return value;
		}
	}
	return String(value);
};

export const searchHref = (
	path: string,
	params: Record<string, SearchParamValue>
): string => {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === "") {
			continue;
		}
		if (Array.isArray(value) && value.length === 0) {
			continue;
		}
		query.set(key, encodeValue(value));
	}
	const queryString = query.toString();
	return queryString ? `${path}?${queryString}` : path;
};
