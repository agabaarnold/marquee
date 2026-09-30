export interface MediaSummary {
	mediaType: "movie" | "tv";
	id: number;
	// movie.title | tv.name
	title: string;
	originalTitle: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	// ISO yyyy-mm-dd (release | first air)
	date: string | null;
	year: number | null;
	// 0–10
	rating: number;
	voteCount: number;
	popularity: number;
	genreIds: number[];
	originalLanguage: string;
}

export interface Video {
	id: string;
	key: string;
	site: "YouTube" | "Vimeo" | string;
	type: string;
	name: string;
	official: boolean;
	publishedAt: string | null;
}
export interface CastMember {
	id: number;
	name: string;
	character: string | null;
	profilePath: string | null;
	order: number;
}
export interface CrewMember {
	id: number;
	name: string;
	job: string;
	department: string;
	profilePath: string | null;
}
export interface WatchProvider {
	id: number;
	name: string;
	logoPath: string | null;
	priority: number;
}
export interface WatchProviders {
	link: string | null;
	flatrate: WatchProvider[];
	rent: WatchProvider[];
	buy: WatchProvider[];
	free: WatchProvider[];
}

export type MediaDetailsBase = MediaSummary & {
	tagline: string | null;
	status: string;
	homepage: string | null;
	genres: { id: number; name: string }[];
	certification: string | null;
	cast: CastMember[];
	crew: CrewMember[];
	videos: Video[];
	images: { backdrops: ImageRef[]; posters: ImageRef[]; logos: ImageRef[] };
	recommendations: MediaSummary[];
	similar: MediaSummary[];
	keywords: { id: number; name: string }[];
	// Keyed by ISO-3166 region.
	providers: Record<string, WatchProviders>;
	externalIds: {
		imdb?: string | null;
		instagram?: string | null;
		x?: string | null;
		facebook?: string | null;
	};
};
export interface ImageRef {
	filePath: string;
	width: number;
	height: number;
	aspectRatio: number;
	voteAverage: number;
}

export type MovieDetails = MediaDetailsBase & {
	mediaType: "movie";
	runtimeMinutes: number | null;
	budget: number;
	revenue: number;
	collection: { id: number; name: string; posterPath: string | null } | null;
	directors: CrewMember[];
	productionCompanies: {
		id: number;
		name: string;
		logoPath: string | null;
		country: string;
	}[];
};

export interface EpisodeSummary {
	id: number;
	seasonNumber: number;
	episodeNumber: number;
	name: string;
	overview: string;
	airDate: string | null;
	runtimeMinutes: number | null;
	stillPath: string | null;
	rating: number;
	voteCount: number;
}
export interface SeasonSummary {
	id: number;
	seasonNumber: number;
	name: string;
	overview: string;
	airDate: string | null;
	episodeCount: number;
	posterPath: string | null;
	rating: number;
}

export type TvDetails = MediaDetailsBase & {
	mediaType: "tv";
	seasons: SeasonSummary[];
	numberOfSeasons: number;
	numberOfEpisodes: number;
	episodeRuntimeMinutes: number | null;
	inProduction: boolean;
	// Scripted, Miniseries…
	seriesType: string;
	creators: { id: number; name: string; profilePath: string | null }[];
	networks: { id: number; name: string; logoPath: string | null }[];
	lastEpisodeToAir: EpisodeSummary | null;
	nextEpisodeToAir: EpisodeSummary | null;
};
export type SeasonDetails = SeasonSummary & {
	episodes: EpisodeSummary[];
	showId: number;
};

export interface PersonDetails {
	id: number;
	name: string;
	biography: string;
	birthday: string | null;
	deathday: string | null;
	placeOfBirth: string | null;
	knownForDepartment: string | null;
	profilePath: string | null;
	externalIds: MediaDetailsBase["externalIds"];
	credits: { cast: PersonCredit[]; crew: PersonCredit[] };
}
export type PersonCredit = MediaSummary & {
	character?: string | null;
	job?: string | null;
	creditId: string;
};

export type SearchResult =
	| (MediaSummary & { kind: "media" })
	| {
			kind: "person";
			id: number;
			name: string;
			profilePath: string | null;
			knownFor: string | null;
	  };
