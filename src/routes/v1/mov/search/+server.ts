import { vrcKV } from '$lib/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tmdb } from '$lib/tmdb';
import type { Movie } from '../types';

export const GET: RequestHandler = async ({ url }) => {
	if (!url.searchParams.has('q') && !url.searchParams.has('input')) {
		error(400, 'Missing query parameters');
	}

	const pool = url?.searchParams?.get('pool') || 'v';

	if (!pool) {
		error(400, 'Missing pool parameter');
	}

	let search = null;

	if (url.searchParams.has('input')) {
		search = url.searchParams.get('input')?.split('→')[1].trim();
	}
	if (url.searchParams.has('q')) {
		search = url.searchParams.get('q')?.trim();
	}
	if (!search) {
		error(400, 'Incorrect query parameter');
	}

	let nextNumber = (await vrcKV.get<number>(`${pool}:nextNumber`)) ?? 0;

	if (nextNumber > 10_000) {
		nextNumber = 0;
	}

	const movies = await tmdb.search.movies({
		query: search
	});

	movies.results = movies.results.filter(
		(result) =>
			result.vote_count >= 50 && result.release_date && new Date(result.release_date) <= new Date()
	);

	let vrcmovies: Movie[] = [];

	for (const movie of movies.results) {
		if (vrcmovies.length >= 10) {
			const isAnime = movie.genre_ids.includes(16) && movie.original_language === 'ja';
			if (isAnime) continue;

			vrcmovies.push({
				title: `${movie.title} (${movie.release_date.split('-')[0]})`,
				releaseYear: movie.release_date.split('-')[0],
				overview: movie.overview,
				rating: `${movie.vote_average.toFixed(1)} / 10`,
				vrcurl: nextNumber
			});

			await vrcKV.set(`${pool}:${nextNumber}`, { type: 'movie', id: movie.id });

			nextNumber++;
		}
	}

	await vrcKV.set(`${pool}:nextNumber`, nextNumber);

	return json({ results: vrcmovies }, { status: 200 });
};
