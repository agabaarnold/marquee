// oxlint-disable react/function-component-definition func-style
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Footer from "#/components/layout/footer.tsx";
import Header from "#/components/layout/header.tsx";
import {
	AnchoredToastProvider,
	ToastProvider,
} from "#/components/ui/toast.tsx";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "theme-color",
				media: "(prefers-color-scheme: light)",
				content: "#FAF8F4",
			},
			{
				name: "theme-color",
				media: "(prefers-color-scheme: dark)",
				content: "#0B0B10",
			},
			{
				title: "Marquee",
				description:
					"A fast, cinematic, server-rendered discovery site for movies and TV series: browse what's trending, explore by genre and filters, read rich detail pages (cast, trailers, where to watch, seasons and episodes), search everything, and keep a local watchlist",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml",
			},
			{
				rel: "icon",
				href: "/favicon-512.png",
				type: "image/png",
				sizes: "512x512",
			},
			{
				rel: "apple-touch-icon",
				href: "/favicon-180.png",
				sizes: "180x180",
			},
			{
				rel: "manifest",
				href: "/site.webmanifest",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ToastProvider>
					<AnchoredToastProvider>
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</AnchoredToastProvider>
				</ToastProvider>

				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
