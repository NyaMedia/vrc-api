import { ScalarApiReference } from '@scalar/sveltekit';
import type { RequestHandler } from './$types';

const handler = ScalarApiReference({
	url: 'https://vrc.nya.llc/openapi.json'
});

export const GET: RequestHandler = () => {
	return handler();
};
