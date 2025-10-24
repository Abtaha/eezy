import { auth } from "@/server/auth/config";

export { auth };
export type { Session, User } from "@/server/auth/config";

export const handlers = auth.handler;
export const getSession = auth.api.getSession;
