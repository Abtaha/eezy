import { createRouteHandler } from "uploadthing/next";

import { eezyFileRouter } from "./core";

export const runtime = "nodejs";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: eezyFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
