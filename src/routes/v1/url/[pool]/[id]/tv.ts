import type { $Fetch } from 'ofetch';
import type { KvURL } from './+server';
import { json, redirect } from '@sveltejs/kit';
import { tmdb } from '$lib/tmdb';
import { vrcKV } from '$lib/db';

export async function tvSeason(customFetch: $Fetch, kvData: KvURL, pool: string) {
	type EpisodeData = {
		name: string;
		overview: string;
		air_date: string;
		vrcurl: number;
	};
	type SeasonData = {
		episodes: EpisodeData[];
	};

	if (!kvData.id || !kvData.season) {
		return json({ error: 'Missing TV show data' }, { status: 500 });
	}
	let nextNumber = (await vrcKV.get<number>(`${pool}:nextNumber`)) ?? 0;

	if (nextNumber > 10_000) {
		nextNumber = 0;
	}

	const tmdbData = await tmdb.tvSeasons.details({
		tvShowID: Number(kvData.id),
		seasonNumber: Number(kvData.season)
	});

	if (!tmdbData) {
		return json({ error: 'TV show not found' }, { status: 500 });
	}

	let seasonData: SeasonData = { episodes: [] };

	for (const episode of tmdbData.episodes) {
		if (episode.season_number === 0) continue;

		seasonData.episodes.push({
			name: `${episode.episode_number} - ${episode.name}`,
			overview: episode.overview,
			air_date: episode.air_date,
			vrcurl: nextNumber
		});

		await vrcKV.set(`${pool}:${nextNumber}`, {
			type: 'tv',
			id: kvData.id,
			season: episode.season_number,
			episode: episode.episode_number
		});

		nextNumber++;
	}

	await vrcKV.set(`${pool}:nextNumber`, nextNumber);

	return json({ episodes: seasonData.episodes }, { status: 200 });
}

export async function tvStream(customFetch: $Fetch, kvData: KvURL) {
	if (!kvData.id || !kvData.season || !kvData.episode) {
		return json({ error: 'Missing TV episode data' }, { status: 500 });
	}

	console.log('Fetching TV stream data...');
	console.log(`ID: ${kvData.id}, Season: ${kvData.season}, Episode: ${kvData.episode}`);

	const { success } = await customFetch(
		`/api/cache/auto/tv/get?id=${kvData.id}&s=${kvData.season}&e=${kvData.episode}`,
		{ timeout: 19000 } // vrc timeout is 19s i think
	).catch(() => ({ success: false }));

	if (success) {
		return redirect(
			302,
			`https://nya.llc/stream/a/${kvData.id}.${kvData.season}.${kvData.episode}`
		);
	} else {
		return redirect(302, '/errorvid');
	}
}
