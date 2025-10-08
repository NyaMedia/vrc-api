import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	return redirect(301, 'https://nya.llc?ref=vrcapi');
};
