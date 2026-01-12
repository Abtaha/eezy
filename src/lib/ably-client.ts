import * as Ably from "ably";
import { env } from "@/env";

export const ablyClient = new Ably.Realtime({
  authUrl: env.NEXT_PUBLIC_APP_URL + "/api/ably/auth",
});
