import { createCaller, appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";
import type { Session } from "@/server/auth";

interface TestContextOptions {
  session?: Session | null;
}

/**
 * Creates a tRPC caller for integration tests.
 * @param session - An optional mock session object for testing protected procedures.
 * @returns A tRPC caller instance.
 */
export const createTestCaller = (opts: TestContextOptions = {}) => {
  // Create a mock context for the tests
  const ctx = {
    db,
    session: opts.session ?? null,
    headers: new Headers(),
  };

  // Create a caller with the test context
  const caller = appRouter.createCaller(ctx);
  return caller;
};
