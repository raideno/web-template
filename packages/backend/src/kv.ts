import { internalConvexKv } from "@raideno/convex-kv/server";

export const { store, kv } = internalConvexKv({
  execution: {
    blocking: true,
  },
});
