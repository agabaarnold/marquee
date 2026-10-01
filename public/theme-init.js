// Applies the stored/OS theme before first paint so the page never flashes
// the wrong theme. Keep in sync with src/features/theme/store.ts.
try {
	var stored = localStorage.getItem("marquee:theme");
	if (stored !== "light" && stored !== "dark") stored = "system";
	var resolved = stored;
	if (stored === "system") {
		resolved = matchMedia("(prefers-color-scheme: light)").matches
			? "light"
			: "dark";
	}
	document.documentElement.dataset.theme = resolved;
	document.documentElement.classList.toggle("dark", resolved === "dark");
} catch {
	// Storage or matchMedia unavailable; the default dark theme applies.
}
