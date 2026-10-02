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
	// oxlint-disable-next-line anti-slop/no-runtime-typeof -- the SearchParamValue union is already the closed domain contract; narrowing it here is exactly branching on the domain value.
	if (typeof value === "object") {
		return JSON.stringify(value);
	}
	// oxlint-disable-next-line anti-slop/no-runtime-typeof -- see above: narrowing the closed SearchParamValue union.
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
		if (
			value === undefined ||
			value === "" ||
			(Array.isArray(value) && value.length === 0)
		) {
			continue;
		}
		query.set(key, encodeValue(value));
	}
	const queryString = query.toString();
	return queryString ? `${path}?${queryString}` : path;
};
