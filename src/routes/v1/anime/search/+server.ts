import { vrcKV } from '$lib/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Anime } from '../types';
import { ofetch } from 'ofetch';

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

	const { data } = await ofetch('https://graphql.anilist.co', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({
			query: `
             query ($page: Int, $perPage: Int, $search: String) {
            Page(page: $page, perPage: $perPage) {
              media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                   id
                   title {
                     romaji
                     english
                     native
                   }
                   coverImage {
                    extraLarge
                   }
                   description
                   status
                   format
                   episodes
                   genres
                   seasonYear
                   averageScore
                   popularity
                 }
               }
             }
           `,
			variables: {
				page: 1,
				perPage: 30,
				search: search
			}
		})
	});

	const results = data?.Page?.media || [];

	let vrcshows: Anime[] = [];

	for (const show of results) {
		if (vrcshows.length >= 10) break;

		if (show.status !== 'FINISHED' && show.status !== 'RELEASING') continue;

		const newShow: Anime = {
			title: show.title.english || show.title.romaji || show.title.native,
			releaseYear: show.seasonYear,
			overview: show.description,
			rating: `${(show.averageScore / 10).toFixed(1)} / 10`,
			episodesUrl: nextNumber
		};

		await vrcKV.set(`${pool}:${nextNumber}`, {
			type: 'anime',
			id: show.id
		});
		if (newShow.episodesUrl) {
			vrcshows.push(newShow);
		}
		nextNumber++;
	}

	await vrcKV.set(`${pool}:nextNumber`, nextNumber);

	return json({ results: vrcshows }, { status: 200 });
};
