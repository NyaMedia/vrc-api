import type { $Fetch } from 'ofetch';
import type { KvURL } from './+server';
import { redirect } from '@sveltejs/kit';

export default async function movie(customFetch: $Fetch, kvData: KvURL) {
	const { success } = await customFetch(
		`/api/cache/auto/movie/get?id=${kvData.id}`,
		{ timeout: 19000 } // vrc timeout is 19s i think
	).catch(() => ({ success: false }));

	console.log('Fetching movie stream data...');
	if (success) {
		return redirect(302, `https://nya.llc/stream/a/${kvData.id}`);
	} else {
		return redirect(302, '/errorvid');
	}
}
