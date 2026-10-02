import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GenreChips } from "#/components/media/genre-chips.tsx";

import { renderWithRouter } from "./router";

const genres = [
	{ id: 28, name: "Action" },
	{ id: 12, name: "Adventure" },
];

describe("GenreChips", () => {
	it("renders linked chips", async () => {
		await renderWithRouter(<GenreChips genres={genres} mediaType="movie" />);
		const action = screen.getByRole("link", { name: "Action" });
		expect(action).toHaveAttribute(
			"href",
			"/discover?genres=%5B28%5D&type=movie"
		);
	});

	it("renders nothing for an empty list or a zero limit", async () => {
		const { container } = await renderWithRouter(
			<GenreChips genres={genres} limit={0} mediaType="movie" />
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders plain chips when unlinked", async () => {
		await renderWithRouter(
			<GenreChips genres={genres} linked={false} mediaType="movie" />
		);
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.getByText("Adventure")).toBeInTheDocument();
	});
});
