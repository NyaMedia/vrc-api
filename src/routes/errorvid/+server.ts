import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const randomNum = Math.floor(Math.random() * 7) + 1;

  return redirect(302, `/errorvids/${randomNum}.mp4`);
};
