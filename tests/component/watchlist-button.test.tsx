import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "./router";

const media = {
	mediaType: "movie",
	id: 550,
	title: "Fight Club",
	posterPath: "/p.jpg",
	year: 1999,
} as const;

const loadButton = () =>
	import("#/features/watchlist/WatchlistButton.tsx");

beforeEach(() => {
	vi.resetModules();
	window.localStorage.clear();
});

describe("WatchlistButton", () => {
	it("toggles the saved state with an accessible name", async () => {
		const user = userEvent.setup();
		const { WatchlistButton } = await loadButton();
		await renderWithRouter(<WatchlistButton media={media} />);
		const button = screen.getByRole("button", {
			name: "Save Fight Club to watchlist",
		});
		expect(button).toHaveAttribute("aria-pressed", "false");
		await user.click(button);
		expect(
			screen.getByRole("button", {
				name: "Remove Fight Club from watchlist",
			})
		).toHaveAttribute("aria-pressed", "true");
	});

	it("renders the full variant with visible text", async () => {
		const { WatchlistButton } = await loadButton();
		await renderWithRouter(<WatchlistButton media={media} variant="full" />);
		expect(
			screen.getByRole("button", { name: /Watchlist/u })
		).toBeInTheDocument();
	});
});
