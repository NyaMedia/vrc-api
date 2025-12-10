import type { $Fetch } from 'ofetch';
import type { KvURL } from './+server';
import { json, redirect } from '@sveltejs/kit';
import { tmdb } from '$lib/tmdb';
import { vrcKV } from '$lib/db';

export async function animeEpisodes(customFetch: $Fetch, kvData: KvURL, pool: string) {
	type EpisodeData = {
		name: string;
		overview: string;
		air_date: string;
		vrcurl: number;
	};
	type SeasonData = {
		episodes: EpisodeData[];
	};

	if (!kvData.id) {
		return json({ error: 'Missing anime data' }, { status: 500 });
	}
	let nextNumber = (await vrcKV.get<number>(`${pool}:nextNumber`)) ?? 0;

	if (nextNumber > 10_000) {
		nextNumber = 0;
	}

	const { episodes, url } = await customFetch(
		`/api/cache/sakura/episodes?id=${kvData.id}&dub=false`
	);

	if (!episodes) {
		return json({ error: 'Anime not found' }, { status: 500 });
	}

	console.log(episodes);

	let seasonData: SeasonData = { episodes: [] };

	for (const episode of episodes) {
		if (episode.season_number === 0) continue;

		seasonData.episodes.push({
			name: `Episode ${episode.episode}`,
			overview: 'N/A',
			air_date: 'N/A',
			vrcurl: nextNumber
		});

		await vrcKV.set(`${pool}:${nextNumber}`, {
			type: 'animestream',
			url: episode.link,
		});

		nextNumber++;
	}

	await vrcKV.set(`${pool}:nextNumber`, nextNumber);

	return json({ episodes: seasonData.episodes }, { status: 200 });
}

export async function animeStream(customFetch: $Fetch, kvData: KvURL) {
	if (!kvData.url) {
		return json({ error: 'Missing anime episode data' }, { status: 500 });
	}

	const { success } = await customFetch(
		`/api/cache/sakura/get?url=${encodeURIComponent(kvData.url)}`,
		{ timeout: 19000 } // vrc timeout is 19s i think
	).catch(() => ({ success: false }));

	if (success) {
		return redirect(
			302,
			`https://nya.llc/stream/sakura/${encodeURIComponent(kvData.url)}`
		);
	} else {
		return redirect(302, '/errorvid');
	}
}
