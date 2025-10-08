import { TMDB_API_KEY } from '$env/static/private';
import { TMDB } from 'tmdb-ts';

export const tmdb = new TMDB(TMDB_API_KEY);

type results = {
	title: string;
	poster_path: string;
	id: number;
	release_date: string;
};

export async function getGenres(type: 'movie' | 'tv' = 'movie') {
	let tmdbGenres;

	if (type === 'movie') {
		tmdbGenres = await tmdb.genres.movies().catch((err) => {
			throw err;
		});
	} else {
		tmdbGenres = await tmdb.genres.tvShows().catch((err) => {
			throw err;
		});
	}

	return tmdbGenres.genres;
}

export async function getTrendingMovies(page: number): Promise<results[]> {
	let movieResults: results[] = [];
	const tmdbPopular = await tmdb.trending.trending('movie', 'week', { page }).catch((err) => {
		throw err;
	});

	tmdbPopular.results.forEach((movie) => {
		movieResults.push({
			title: movie.title,
			poster_path: movie.poster_path,
			id: movie.id,
			release_date: movie.release_date
		});
	});

	return movieResults;
}

export async function getMediaByGenre(
	page: number,
	genre: string,
	type: 'movie' | 'tv' = 'movie'
): Promise<results[]> {
	if (type === 'movie') {
		let response = await tmdb.discover
			.movie({
				include_adult: false,
				include_video: false,
				language: 'en-US',
				page,
				sort_by: 'popularity.desc',
				with_genres: genre
			})
			.catch((err) => {
				throw err;
			});

		const results = response.results.map((item) => ({
			title: item.title,
			poster_path: item.poster_path,
			id: item.id,
			release_date: item.release_date
		}));

		return results;
	} else {
		let response = await tmdb.discover
			.tvShow({
				include_adult: false,
				language: 'en-US',
				page,
				sort_by: 'popularity.desc',
				with_genres: genre
			})
			.catch((err) => {
				throw err;
			});

		const results = response.results.map((item) => ({
			title: item.name,
			poster_path: item.poster_path,
			id: item.id,
			release_date: item.first_air_date
		}));

		return results;
	}
}

export async function getTrendingSeries(page: number): Promise<results[]> {
	const tmdbPopular = await tmdb.trending.trending('tv', 'week', { page }).catch((err) => {
		throw err;
	});

	const results: results[] = tmdbPopular.results.map((series) => ({
		title: series.name,
		poster_path: series.poster_path,
		id: series.id,
		release_date: series.first_air_date
	}));

	return results;
}
