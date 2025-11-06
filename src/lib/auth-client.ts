import { createAuthClient } from "better-auth/react";
import type { auth } from "@/server/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { env } from "@/env";

export const authClient = createAuthClient({
   baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
   
});
