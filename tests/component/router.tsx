import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

/** Renders UI with a minimal TanStack Router so <Link> works. */
export const renderWithRouter = async (ui: ReactElement) => {
	const rootRoute = createRootRoute();
	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => ui,
	});
	const routeTree = rootRoute.addChildren([indexRoute]);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	await router.load();
	return { ...render(<RouterProvider router={router} />), router };
};
