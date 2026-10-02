import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeToggle } from "#/features/theme/theme-toggle.tsx";

import { renderWithRouter } from "./router";

describe("ThemeToggle", () => {
	it("cycles system to light and persists the choice", async () => {
		const user = userEvent.setup();
		window.localStorage.clear();
		await renderWithRouter(<ThemeToggle />);
		const button = screen.getByRole("button", {
			name: "Switch to light theme",
		});
		await user.click(button);
		expect(window.localStorage.getItem("marquee:theme")).toBe("light");
		expect(
			screen.getByRole("button", { name: "Switch to dark theme" })
		).toBeInTheDocument();
		expect(document.documentElement.dataset.theme).toBe("light");
	});
});
