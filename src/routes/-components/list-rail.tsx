import { useSuspenseQuery } from "@tanstack/react-query";

import { MediaRail } from "#/components/media/media-rail.tsx";
import { listQuery } from "#/queries/media.ts";
import type { MediaType } from "#/schemas/common.ts";

export const ListRail = ({
	type,
	category,
	title,
	href,
}: {
	type: MediaType;
	category: string;
	title: string;
	href?: string;
}) => {
	const { data } = useSuspenseQuery(listQuery(type, category));
	return <MediaRail href={href} items={data.results} title={title} />;
};
