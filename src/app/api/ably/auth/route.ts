import { env } from "@/env";

import Ably from "ably";

const ably = new Ably.Rest({
  key: env.ABLY_API_KEY!,
});

export async function GET() {
  const tokenRequest = await ably.auth.createTokenRequest();
  return Response.json(tokenRequest);
}
