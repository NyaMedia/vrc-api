import { ratelimitKV } from '$lib/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const ip = event.getClientAddress();
	const key = `ratelimit:${ip}`;
	const limit = 20;
	const windowMs = 60 * 1000; // 1 minute

	const now = Date.now();
	const data = (await ratelimitKV.getItem(key)) as { count: number; reset: number } | null;

	if (!data || data.reset < now) {
		await ratelimitKV.setItem(key, {
			count: 1,
			reset: now + windowMs
		});
	} else {
		if (data.count >= limit) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': Math.ceil((data.reset - now) / 1000).toString()
				}
			});
		}

		await ratelimitKV.setItem(key, {
			count: data.count + 1,
			reset: data.reset
		});
	}

	const response = await resolve(event);
	return response;
};
