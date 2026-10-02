import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PaginationNav } from "#/components/navigation/pagination-nav.tsx";

import { renderWithRouter } from "./router";

describe("PaginationNav", () => {
	it("renders nothing for a single page", async () => {
		const { container } = await renderWithRouter(
			<PaginationNav
				hrefForPage={(page) => `/movies?page=${page}`}
				page={1}
				totalPages={1}
			/>
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("windows pages with ellipses and marks the current page", async () => {
		await renderWithRouter(
			<PaginationNav
				hrefForPage={(page) => `/movies?page=${page}`}
				page={1}
				totalPages={500}
			/>
		);
		const nav = screen.getByRole("navigation", { name: "pagination" });
		expect(within(nav).getByRole("link", { name: "1" })).toHaveAttribute(
			"aria-current",
			"page"
		);
		expect(within(nav).getByRole("link", { name: "2" })).toHaveAttribute(
			"href",
			"/movies?page=2"
		);
		expect(within(nav).getByRole("link", { name: "500" })).toBeInTheDocument();
		expect(
			within(nav).queryByRole("link", { name: "Go to previous page" })
		).not.toBeInTheDocument();
		expect(
			within(nav).getByRole("link", { name: "Go to next page" })
		).toBeInTheDocument();
	});

	it("shows previous and next in the middle", async () => {
		await renderWithRouter(
			<PaginationNav
				hrefForPage={(page) => `/movies?page=${page}`}
				page={250}
				totalPages={500}
			/>
		);
		const nav = screen.getByRole("navigation", { name: "pagination" });
		expect(
			within(nav).getByRole("link", { name: "Go to previous page" })
		).toHaveAttribute("href", "/movies?page=249");
		expect(
			within(nav).getByRole("link", { name: "Go to next page" })
		).toHaveAttribute("href", "/movies?page=251");
	});
});
