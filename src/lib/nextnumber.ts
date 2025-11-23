import type { Storage } from 'unstorage';
import type { KvURL } from '../routes/v1/url/[pool]/[id]/+server';

export async function nextNumber(pool: string, vrcKV: Storage): Promise<number> {
	let nextNumber = (await vrcKV.get<number>(`${pool}:nextNumber`)) ?? 0;
	if (nextNumber > 10_000) {
		nextNumber = 0;
	}

	const kvData = await vrcKV.get<KvURL>(`${pool}:${nextNumber}`);

	let nextKv = kvData;
	const now = Math.floor(Date.now() / 1000);
	let attempts = 0;

	while (nextKv?.safe && nextKv.safe > now && attempts <= 10000) {
		nextNumber++;
		if (nextNumber > 10_000) nextNumber = 0;
		nextKv = await vrcKV.get<KvURL>(`${pool}:${nextNumber}`);
		attempts++;
	}

	return nextNumber;
}
