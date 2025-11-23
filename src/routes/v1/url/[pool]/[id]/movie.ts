import type { $Fetch } from 'ofetch';
import type { KvURL } from './+server';
import { redirect } from '@sveltejs/kit';
import { vrcKV } from '$lib/db';

export default async function movie(
	customFetch: $Fetch,
	kvData: KvURL,
	pool: string,
	urlid: string
) {
	const { success } = await customFetch(`/api/cache/auto/movie/get?id=${kvData.id}`);

	console.log('Fetching movie stream data...');
	if (success) {
		const safeUntil = Math.floor(Date.now() / 1000) + 5 * 60 * 60;
		vrcKV.set(`${pool}:${urlid}`, { type: 'movie', id: kvData.id, safe: safeUntil });
		return redirect(302, `https://nya.llc/stream/a/${kvData.id}`);
	} else {
		return redirect(302, '/errorvid');
	}
}
