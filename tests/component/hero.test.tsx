import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Hero } from "#/routes/-components/hero.tsx";
import type { MediaSummary } from "#/types/media.ts";
import { renderWithRouter } from "./router";

const makeMedia = (id: number, title: string): MediaSummary => ({
	mediaType: "movie",
	id,
	title,
	originalTitle: title,
	overview: `${title} overview`,
	posterPath: "/p.jpg",
	backdropPath: "/b.jpg",
	date: "2026-01-01",
	year: 2026,
	rating: 7.5,
	voteCount: 100,
	popularity: 10,
	genreIds: [],
	originalLanguage: "en",
});

const items = [makeMedia(1, "One"), makeMedia(2, "Two")];

describe("Hero", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders nothing without items", async () => {
		const { container } = await renderWithRouter(<Hero items={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("advances slides on a timer and on dot clicks", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		await renderWithRouter(<Hero items={items} />);
		expect(
			screen.getByRole("region", { name: "Spotlight" })
		).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: /Show slide/ })).toHaveLength(2);
		expect(screen.getByRole("heading", { name: "One" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Show slide 2: Two" }));
		expect(screen.getByRole("heading", { name: "Two" })).toBeInTheDocument();
	});

	it("auto-advances after the interval", async () => {
		await renderWithRouter(<Hero items={items} />);
		expect(screen.getByRole("heading", { name: "One" })).toBeInTheDocument();
		await vi.advanceTimersByTimeAsync(6000);
		expect(screen.getByRole("heading", { name: "Two" })).toBeInTheDocument();
	});
});
