import { vrcKV } from '$lib/db';
import { error, redirect, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ofetch } from 'ofetch';
import movie from './movie';
import { tvSeason, tvStream } from './tv';
import { animeEpisodes, animeStream } from './anime';

export type KvURL = {
	type: 'movie' | 'tvseason' | 'tv' | 'animestream' | 'anime';
	id?: number;
	season?: number;
	episode?: number;
	url?: string;
	number?: number;
};

export const GET: RequestHandler = async ({ params }) => {
	if (!process.env.NYA_API_KEY) {
		error(500, 'Missing NYA API key');
	}

	const customFetch = ofetch.create({
		baseURL: 'https://nya.llc',
		headers: { 'x-api-key': process.env.NYA_API_KEY }
	});

	const kvData = await vrcKV.get<KvURL>(`${params.pool}:${params.id}`);

	if (!kvData) {
		error(400, 'how');
	}

	if (kvData.type == 'movie') {
		return movie(customFetch, kvData);
	} else if (kvData.type == 'tvseason') {
		return tvSeason(customFetch, kvData, params.pool);
	} else if (kvData.type == 'tv') {
		return tvStream(customFetch, kvData);
	} else if (kvData.type == 'anime') {
		return animeEpisodes(customFetch, kvData, params.pool);
	} else if (kvData.type == 'animestream') {
		return animeStream(customFetch, kvData);
	} else {
		return json({ error: 'Unknown type' });
	}
};
