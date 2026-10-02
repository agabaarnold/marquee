import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RatingRing } from "#/components/media/rating-ring.tsx";
import { renderWithRouter } from "./router";

describe("RatingRing", () => {
	it("announces rating and vote count", async () => {
		await renderWithRouter(<RatingRing value={8.1} votes={12304} />);
		const ring = screen.getByRole("img");
		expect(ring).toHaveAttribute("aria-label", expect.stringContaining("8.1 out of 10"));
		expect(ring).toHaveAttribute("aria-label", expect.stringContaining("votes"));
		expect(screen.getByText("8.1")).toBeInTheDocument();
	});

	it("falls back for non-finite values", async () => {
		await renderWithRouter(<RatingRing value={Number.NaN} />);
		expect(screen.getByRole("img")).toHaveAttribute(
			"aria-label",
			"0.0 out of 10"
		);
		expect(screen.getByText("—")).toBeInTheDocument();
	});
});
