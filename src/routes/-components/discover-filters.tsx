import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";

import { Input } from "#/components/ui/input.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { segmentedControlItemVariants } from "#/lib/segmented-control.ts";
import { genresQuery, providersQuery } from "#/queries/media.ts";
import type { MediaType } from "#/schemas/common.ts";
import type { DiscoverSearch } from "#/schemas/discover.ts";

type SearchUpdater = (previous: DiscoverSearch) => DiscoverSearch;

export const FilterChip = ({
	active,
	children,
	search,
}: {
	active: boolean;
	children: ReactNode;
	search: SearchUpdater;
}) => (
	<Link
		aria-current={active ? "page" : undefined}
		className={segmentedControlItemVariants(active ? { state: "current" } : {})}
		from="/discover"
		search={search}
	>
		{children}
	</Link>
);

const toggleId = (active: number[], id: number): number[] =>
	active.includes(id)
		? active.filter((value) => value !== id)
		: [...active, id];

export const FilterSkeleton = ({ label }: { label: string }) => (
	<fieldset>
		<legend className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
			{label}
		</legend>
		<div aria-hidden="true" className="mt-2 flex flex-wrap gap-1.5">
			{["a", "b", "c", "d"].map((key) => (
				<div key={key} className="h-7 w-16 overflow-hidden rounded-full">
					<Skeleton className="size-full" />
				</div>
			))}
		</div>
	</fieldset>
);

const FilterGroup = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<fieldset>
		<legend className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
			{label}
		</legend>
		<div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
	</fieldset>
);

export const DiscoverGenres = ({
	mediaType,
	active,
}: {
	mediaType: MediaType;
	active: number[];
}) => {
	const { data: genres } = useSuspenseQuery(genresQuery(mediaType));
	const activeSet = new Set(active);
	return (
		<FilterGroup label="Genres">
			{genres.map((genre) => (
				<FilterChip
					key={genre.id}
					active={activeSet.has(genre.id)}
					search={(previous) => ({
						...previous,
						genres: toggleId(active, genre.id),
						page: 1,
					})}
				>
					{genre.name}
				</FilterChip>
			))}
		</FilterGroup>
	);
};

const PROVIDER_COUNT = 12;

export const DiscoverProviders = ({
	mediaType,
	region,
	active,
}: {
	mediaType: MediaType;
	region: string;
	active: number[];
}) => {
	const { data } = useSuspenseQuery(providersQuery(mediaType, region));
	const [showAll, setShowAll] = useState(false);
	const activeSet = new Set(active);
	// oxlint-disable-next-line unicorn/no-array-sort -- sorting a fresh copy; nothing else observes it.
	const ranked = [...data.results].sort((a, b) => a.priority - b.priority);
	const visible = showAll ? ranked : ranked.slice(0, PROVIDER_COUNT);
	return (
		<FilterGroup label="Streaming providers">
			{visible.map((provider) => (
				<FilterChip
					key={provider.id}
					active={activeSet.has(provider.id)}
					search={(previous) => ({
						...previous,
						providers: toggleId(active, provider.id),
						page: 1,
					})}
				>
					{provider.name}
				</FilterChip>
			))}
			{ranked.length > PROVIDER_COUNT && (
				<button
					className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-2"
					onClick={() => {
						setShowAll((value) => !value);
					}}
					type="button"
				>
					{showAll ? "Show fewer" : `Show all ${ranked.length} providers`}
				</button>
			)}
		</FilterGroup>
	);
};

const parseYear = (value: string): number | undefined => {
	const trimmed = value.trim();
	if (!trimmed) {
		return undefined;
	}
	const year = Number(trimmed);
	return Number.isInteger(year) ? year : undefined;
};

export const DiscoverYears = ({
	from,
	to,
	onApply,
}: {
	from?: number;
	to?: number;
	onApply: (years: { yearFrom?: number; yearTo?: number }) => void;
}) => {
	const [fromDraft, setFromDraft] = useState(
		from === undefined ? "" : `${from}`
	);
	const [toDraft, setToDraft] = useState(to === undefined ? "" : `${to}`);
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onApply({ yearFrom: parseYear(fromDraft), yearTo: parseYear(toDraft) });
			}}
		>
			<fieldset>
				<legend className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
					Release years
				</legend>
				<div className="mt-2 flex items-center gap-2">
					<Input
						aria-label="Year from"
						inputMode="numeric"
						max={2100}
						min={1888}
						onChange={(event) => {
							setFromDraft(event.target.value);
						}}
						placeholder="From"
						type="number"
						value={fromDraft}
					/>
					<span aria-hidden="true" className="text-muted-foreground">
						–
					</span>
					<Input
						aria-label="Year to"
						inputMode="numeric"
						max={2100}
						min={1888}
						onChange={(event) => {
							setToDraft(event.target.value);
						}}
						placeholder="To"
						type="number"
						value={toDraft}
					/>
					<button
						className="bg-primary text-primary-foreground shrink-0 rounded-full px-4 py-1.5 text-sm font-medium"
						type="submit"
					>
						Apply
					</button>
				</div>
			</fieldset>
		</form>
	);
};
