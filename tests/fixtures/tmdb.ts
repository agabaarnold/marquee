// Realistic TMDB API payloads (shapes per developer.themoviedb.org).
// Edge cases covered: null vs "" dates/paths, missing runtime,
// malformed credit rows, empty homepage, non-US certifications.

export const movieSummary = {
	id: 550,
	title: "Fight Club",
	original_title: "Fight Club",
	overview: "An insomniac office worker...",
	poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
	backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
	release_date: "1999-10-15",
	vote_average: 8.4,
	vote_count: 28000,
	popularity: 61.4,
	genre_ids: [18],
	original_language: "en",
};

export const movieSummarySparse = {
	id: 999,
	title: "Untitled",
	poster_path: null,
	backdrop_path: null,
	release_date: "",
};

export const tvSummary = {
	id: 1396,
	name: "Breaking Bad",
	original_name: "Breaking Bad",
	overview: "A chemistry teacher...",
	poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
	backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
	first_air_date: "2008-01-20",
	vote_average: 8.9,
	vote_count: 15000,
	popularity: 120.5,
	genre_ids: [18, 80],
	original_language: "en",
};

export const movieDetails = {
	...movieSummary,
	tagline: "Mischief. Mayhem. Soap.",
	runtime: 139,
	status: "Released",
	homepage: "",
	budget: 63000000,
	revenue: 10092709,
	genres: [{ id: 18, name: "Drama" }],
	belongs_to_collection: null,
	production_companies: [
		{ id: 508, name: "Regency Enterprises", logo_path: null, origin_country: "US" },
	],
	credits: {
		cast: [
			{
				id: 819,
				name: "Edward Norton",
				character: "The Narrator",
				profile_path: null,
				order: 0,
			},
			// Malformed row: dropped by lenientArray, must not fail the page.
			{ id: "bad", name: 42 },
		],
		crew: [
			{
				id: 7467,
				name: "David Fincher",
				job: "Director",
				department: "Directing",
				profile_path: null,
			},
			{
				id: 7468,
				name: "Jim Uhls",
				job: "Screenplay",
				department: "Writing",
				profile_path: null,
			},
		],
	},
	videos: {
		results: [
			{
				id: "v1",
				key: "qtRKdVHc-cE",
				site: "YouTube",
				type: "Trailer",
				name: "Official Trailer",
				official: true,
				published_at: "2015-02-11T00:00:00.000Z",
			},
		],
	},
	images: {
		backdrops: [
			{
				file_path: "/b.jpg",
				width: 1280,
				height: 720,
				aspect_ratio: 1.78,
				vote_average: 5.5,
			},
		],
		posters: [],
		logos: [],
	},
	recommendations: { page: 1, results: [], total_pages: 0, total_results: 0 },
	similar: { page: 1, results: [], total_pages: 0, total_results: 0 },
	release_dates: {
		results: [
			{
				iso_3166_1: "DE",
				release_dates: [{ certification: "16", type: 3 }],
			},
			{
				iso_3166_1: "US",
				release_dates: [
					{ certification: "", type: 1 },
					{ certification: "R", type: 3 },
				],
			},
		],
	},
	"watch/providers": {
		results: {
			US: {
				link: "https://www.themoviedb.org/movie/550/watch?locale=US",
				flatrate: [
					{
						provider_id: 8,
						provider_name: "Netflix",
						logo_path: "/n.jpg",
						display_priority: 1,
					},
				],
				rent: [],
				buy: [],
			},
		},
	},
	keywords: { keywords: [{ id: 1, name: "fight" }] },
	external_ids: {
		imdb_id: "tt0137523",
		instagram_id: null,
		twitter_id: "fightclub",
		facebook_id: null,
	},
};

export const tvDetails = {
	...tvSummary,
	tagline: null,
	status: "Ended",
	homepage: null,
	genres: [{ id: 18, name: "Drama" }],
	created_by: [{ id: 1, name: "Vince Gilligan", profile_path: null }],
	networks: [{ id: 174, name: "AMC", logo_path: null }],
	seasons: [
		{
			id: 3577,
			season_number: 1,
			name: "Season 1",
			overview: "",
			air_date: "2008-01-20",
			episode_count: 7,
			poster_path: null,
			vote_average: 8.2,
		},
	],
	number_of_seasons: 5,
	number_of_episodes: 62,
	episode_run_time: [49],
	in_production: false,
	type: "Scripted",
	aggregate_credits: {
		cast: [
			{
				id: 17419,
				name: "Bryan Cranston",
				profile_path: null,
				order: 0,
				roles: [
					{ credit_id: "c1", character: "Walter White", episode_count: 62 },
				],
			},
		],
		crew: [
			{
				id: 1,
				name: "Vince Gilligan",
				profile_path: null,
				department: "Directing",
				jobs: [{ credit_id: "j1", job: "Director", episode_count: 5 }],
			},
		],
	},
	videos: { results: [] },
	images: { backdrops: [], posters: [], logos: [] },
	recommendations: { page: 1, results: [], total_pages: 0, total_results: 0 },
	similar: { page: 1, results: [], total_pages: 0, total_results: 0 },
	content_ratings: {
		results: [
			{ iso_3166_1: "DE", rating: "16" },
			{ iso_3166_1: "US", rating: "TV-MA" },
		],
	},
	"watch/providers": { results: {} },
	keywords: { results: [{ id: 2, name: "drugs" }] },
	external_ids: {
		imdb_id: "tt0903747",
		instagram_id: null,
		twitter_id: null,
		facebook_id: null,
	},
	last_episode_to_air: {
		id: 10,
		season_number: 5,
		episode_number: 16,
		name: "Felina",
		overview: "",
		air_date: "2013-09-29",
		runtime: 55,
		still_path: null,
		vote_average: 9.2,
		vote_count: 500,
	},
	next_episode_to_air: null,
};

export const seasonDetails = {
	id: 3577,
	season_number: 1,
	name: "Season 1",
	overview: "",
	air_date: "2008-01-20",
	episode_count: 7,
	poster_path: null,
	vote_average: 8.2,
	episodes: [
		{
			id: 11,
			season_number: 1,
			episode_number: 1,
			name: "Pilot",
			overview: "",
			air_date: "2008-01-20",
			runtime: 58,
			still_path: null,
			vote_average: 8.0,
			vote_count: 300,
		},
	],
};

export const personDetails = {
	id: 819,
	name: "Edward Norton",
	biography: "An American actor...",
	birthday: "1969-08-18",
	deathday: null,
	place_of_birth: "Boston, Massachusetts, USA",
	known_for_department: "Acting",
	profile_path: null,
	external_ids: {
		imdb_id: "nm0001570",
		instagram_id: null,
		twitter_id: null,
		facebook_id: null,
	},
	combined_credits: {
		cast: [
			{
				...movieSummary,
				media_type: "movie",
				character: "The Narrator",
				credit_id: "cc1",
			},
			{
				...tvSummary,
				media_type: "tv",
				character: "Guest Star",
				credit_id: "cc2",
			},
		],
		crew: [
			{
				...movieSummary,
				media_type: "movie",
				job: "Producer",
				credit_id: "cj1",
			},
		],
	},
};

export const trendingPage = {
	page: 1,
	results: [
		{ ...movieSummary, media_type: "movie" },
		{ ...tvSummary, media_type: "tv" },
		{
			media_type: "person",
			id: 819,
			name: "Edward Norton",
			profile_path: null,
			known_for_department: "Acting",
		},
		{ media_type: "movie", id: "bad" },
	],
	total_pages: 1000,
	total_results: 20000,
};

export const searchMultiPage = {
	page: 1,
	results: [
		{ ...movieSummary, media_type: "movie" },
		{
			media_type: "person",
			id: 819,
			name: "Edward Norton",
			profile_path: null,
			known_for_department: "Acting",
		},
	],
	total_pages: 5,
	total_results: 90,
};

export const discoverPage = {
	page: 2,
	results: [
		movieSummary,
		{ ...movieSummary, id: 551, title: "Second Title" },
	],
	total_pages: 500,
	total_results: 10000,
};

export const providersList = {
	results: [
		{
			provider_id: 8,
			provider_name: "Netflix",
			logo_path: "/n.jpg",
			display_priority: 1,
			display_priorities: { US: 1, CA: 2 },
		},
	],
};

export const genresList = {
	genres: [
		{ id: 28, name: "Action" },
		{ id: 12, name: "Adventure" },
	],
};
