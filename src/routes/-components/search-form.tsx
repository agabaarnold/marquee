import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Input } from "#/components/ui/input.tsx";

export const SearchForm = ({ initialQuery }: { initialQuery: string }) => {
	const navigate = useNavigate({ from: "/search" });
	const [draft, setDraft] = useState(initialQuery);

	return (
		<form
			className="flex max-w-xl gap-2"
			onSubmit={(event) => {
				event.preventDefault();
				void navigate({
					search: (previous) => ({ ...previous, page: 1, q: draft }),
				});
			}}
		>
			<Input
				aria-label="Search movies, series, and people"
				maxLength={100}
				onChange={(event) => {
					setDraft(event.target.value);
				}}
				placeholder="Titles, series, people…"
				type="search"
				value={draft}
			/>
			<button
				className="bg-primary text-primary-foreground shrink-0 rounded-full px-5 py-2 text-sm font-medium"
				type="submit"
			>
				Search
			</button>
		</form>
	);
};
