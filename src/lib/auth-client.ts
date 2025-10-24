import { createAuthClient } from "better-auth/react";
import type { auth } from "@/server/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
