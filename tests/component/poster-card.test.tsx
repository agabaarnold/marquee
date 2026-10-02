import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PosterCard } from "#/components/media/poster-card.tsx";
import type { MediaSummary } from "#/types/media.ts";

import { renderWithRouter } from "./router";

const media: MediaSummary = {
	mediaType: "movie",
	id: 550,
	title: "Fight Club",
	originalTitle: "Fight Club",
	overview: "...",
	posterPath: "/p.jpg",
	backdropPath: null,
	date: "1999-10-15",
	year: 1999,
	rating: 8.4,
	voteCount: 28_000,
	popularity: 61,
	genreIds: [18],
	originalLanguage: "en",
};

describe("PosterCard", () => {
	it("links to the details page with an accessible name", async () => {
		await renderWithRouter(<PosterCard media={media} />);
		const link = screen.getByRole("link", {
			name: "Fight Club (1999), Movie",
		});
		expect(link).toHaveAttribute("href", "/movie/550-fight-club");
		expect(screen.getByText("1999")).toBeInTheDocument();
	});

	it("falls back to a typographic placeholder without a poster", async () => {
		const { container } = await renderWithRouter(
			<PosterCard media={{ ...media, posterPath: null }} />
		);
		expect(container.querySelector("img")).not.toBeInTheDocument();
		expect(
			screen.getByText("Fight Club", { selector: "span" })
		).toBeInTheDocument();
	});

	it("hides the rating ring when unrated", async () => {
		await renderWithRouter(<PosterCard media={{ ...media, rating: 0 }} />);
		expect(
			screen.queryByRole("img", { name: /out of 10/u })
		).not.toBeInTheDocument();
	});
});
