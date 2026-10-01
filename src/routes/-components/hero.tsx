import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useEffect, useState } from "react";

import { MediaTypeBadge } from "#/components/media/media-type-badge.tsx";
import { RatingRing } from "#/components/media/rating-ring.tsx";
import { imageUrl } from "#/lib/images.ts";
import { mediaPath } from "#/lib/slug.ts";
import type { MediaSummary } from "#/types/media.ts";

const SLIDE_INTERVAL_MS = 6000;
const SLIDE_COUNT = 5;

const usePrefersReducedMotion = (): boolean => {
	const [reduced, setReduced] = useState(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onChange = (event: MediaQueryListEvent) => {
			setReduced(event.matches);
		};
		query.addEventListener("change", onChange);
		return () => {
			query.removeEventListener("change", onChange);
		};
	}, []);

	return reduced;
};

export const Hero = ({
	items,
	autoAdvance = true,
}: {
	/** Top trending; the first SLIDE_COUNT become slides. */
	items: MediaSummary[];
	autoAdvance?: boolean;
}) => {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const reducedMotion = usePrefersReducedMotion();
	const slides = items.slice(0, SLIDE_COUNT);

	useEffect(() => {
		if (!autoAdvance || reducedMotion || paused || slides.length < 2) {
			return;
		}
		const id = window.setInterval(() => {
			if (!document.hidden) {
				setIndex((current) => (current + 1) % slides.length);
			}
		}, SLIDE_INTERVAL_MS);
		return () => {
			window.clearInterval(id);
		};
	}, [autoAdvance, reducedMotion, paused, slides.length]);

	if (slides.length === 0) {
		return null;
	}
	// Index can outlive the list when toggles swap it; wrap instead of crashing.
	const safeIndex = index % slides.length;
	const media = slides[safeIndex];

	return (
		// oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- hover-to-pause on the carousel region is the documented pattern; keyboard users navigate via the dots and reduced-motion disables rotation entirely.
		<section
			aria-label="Spotlight"
			aria-roledescription="carousel"
			className="hero"
			onMouseEnter={() => {
				setPaused(true);
			}}
			onMouseLeave={() => {
				setPaused(false);
			}}
		>
			{slides.map((item, itemIndex) => {
				const backdrop = imageUrl(item.backdropPath, 1280);
				return (
					backdrop && (
						// Sits under the .hero::after scrim gradient.
						<img
							key={`${item.mediaType}-${item.id}`}
							alt=""
							aria-hidden="true"
							className={cn(
								"absolute inset-0 -z-10 size-full object-cover transition-opacity duration-500",
								itemIndex === safeIndex ? "opacity-100" : "opacity-0"
							)}
							decoding="async"
							fetchPriority={itemIndex === 0 ? "high" : "auto"}
							loading={itemIndex === 0 ? "eager" : "lazy"}
							src={backdrop}
						/>
					)
				);
			})}
			<div
				key={`${media.mediaType}-${media.id}`}
				className="page-transition relative flex min-h-80 flex-col justify-end gap-3 p-6 sm:p-8"
			>
				<MediaTypeBadge className="self-start" mediaType={media.mediaType} />
				<h1 className="font-heading max-w-3xl text-4xl text-white sm:text-5xl">
					{media.title}
				</h1>
				{media.overview && (
					<p className="line-clamp-3 max-w-2xl text-sm text-white/80 sm:text-base">
						{media.overview}
					</p>
				)}
				<div className="mt-1 flex items-center gap-4">
					<RatingRing value={media.rating} votes={media.voteCount} />
					<Link
						className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium"
						to={mediaPath(media)}
					>
						More info
					</Link>
				</div>
				{slides.length > 1 && (
					<div className="mt-2 flex gap-2">
						{slides.map((item, itemIndex) => (
							<button
								key={`${item.mediaType}-${item.id}`}
								aria-current={itemIndex === safeIndex ? "true" : undefined}
								aria-label={`Show slide ${itemIndex + 1}: ${item.title}`}
								className={cn(
									"h-1.5 rounded-full transition-all",
									itemIndex === safeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
								)}
								onClick={() => setIndex(itemIndex)}
								type="button"
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};
