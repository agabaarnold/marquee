import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { buttonVariants } from "#/components/ui/button.tsx";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
} from "#/components/ui/pagination.tsx";

interface PageToken {
	key: string;
	page: number | null;
}

const windowedPages = (page: number, totalPages: number): PageToken[] => {
	const wanted = new Set(
		[1, totalPages, page - 1, page, page + 1].filter(
			(candidate): candidate is number =>
				candidate >= 1 && candidate <= totalPages
		)
	);
	// oxlint-disable-next-line unicorn/no-array-sort -- sorting a fresh array built from the set above; nothing else observes it.
	const sorted = [...wanted].sort((a, b) => a - b);
	const tokens: PageToken[] = [];
	for (const [position, value] of sorted.entries()) {
		const previous = sorted[position - 1];
		if (previous !== undefined && value - previous > 1) {
			tokens.push({ key: `gap-${previous}-${value}`, page: null });
		}
		tokens.push({ key: `page-${value}`, page: value });
	}
	return tokens;
};

export const PaginationNav = ({
	page,
	totalPages,
	hrefForPage,
}: {
	page: number;
	totalPages: number;
	hrefForPage: (page: number) => string;
}) => {
	if (totalPages <= 1) {
		return null;
	}
	return (
		<Pagination>
			<PaginationContent>
				{page > 1 && (
					<PaginationItem>
						<PaginationLink
							aria-label="Go to previous page"
							render={
								<Link
									className={cn(
										buttonVariants({ size: "default" }),
										"max-sm:aspect-square max-sm:p-0"
									)}
									to={hrefForPage(page - 1)}
								>
									<ChevronLeftIcon className="sm:-ms-1" />
									<span className="max-sm:hidden">Previous</span>
								</Link>
							}
						/>
					</PaginationItem>
				)}
				{windowedPages(page, totalPages).map((token) =>
					token.page === null ? (
						<PaginationItem key={token.key}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={token.key}>
							<PaginationLink
								isActive={token.page === page}
								render={
									<Link
										className={buttonVariants({
											size: "icon",
											variant: token.page === page ? "outline" : "ghost",
										})}
										to={hrefForPage(token.page)}
									>
										{token.page}
									</Link>
								}
							/>
						</PaginationItem>
					)
				)}
				{page < totalPages && (
					<PaginationItem>
						<PaginationLink
							aria-label="Go to next page"
							render={
								<Link
									className={cn(
										buttonVariants({ size: "default" }),
										"max-sm:aspect-square max-sm:p-0"
									)}
									to={hrefForPage(page + 1)}
								>
									<span className="max-sm:hidden">Next</span>
									<ChevronRightIcon className="sm:-me-1" />
								</Link>
							}
						/>
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
};
