import * as Ably from "ably";

export const ablyClient = new Ably.Realtime({
  authUrl: "/api/ably/auth",
});
