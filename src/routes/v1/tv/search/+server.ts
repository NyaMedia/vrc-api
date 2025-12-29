import { vrcKV } from '$lib/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tmdb } from '$lib/tmdb';
import type { Show } from '../types';

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

	const shows = await tmdb.search.tvShows({
		query: search
	});

	shows.results = shows.results.filter(
		(result) =>
			result.vote_count >= 30 &&
			result.first_air_date &&
			new Date(result.first_air_date) <= new Date()
	);

	let vrcshows: Show[] = [];

	for (const show of shows.results) {
		if (vrcshows.length >= 10) break;

		const isAnime = show.genre_ids.includes(16) && show.original_language === 'ja';
		if (isAnime) continue;

		const showDetails = await tmdb.tvShows.details(show.id);

		const newShow: Show = {
			title: show.name,
			releaseYear: show.first_air_date.split('-')[0],
			overview: show.overview,
			rating: `${show.vote_average.toFixed(1)} / 10`,
			seasons: []
		};

		// Add all seasons for this show
		for (const season of showDetails.seasons) {
			if (season.season_number === 0) continue;

			newShow.seasons.push({
				seasonName: season.name,
				vrcurl: nextNumber
			});

			await vrcKV.set(`${pool}:${nextNumber}`, {
				type: 'tvseason',
				id: show.id,
				season: season.season_number
			});

			nextNumber++;
		}

		if (newShow.seasons.length > 0) {
			vrcshows.push(newShow);
		}
	}

	await vrcKV.set(`${pool}:nextNumber`, nextNumber);

	return json({ results: vrcshows }, { status: 200 });
};
