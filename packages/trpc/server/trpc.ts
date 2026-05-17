import { initTRPC } from "@trpc/server";

/**
 * Context is empty for the starter. Add authentication state here when needed,
 * e.g. `session: Session | null`.
 */
// biome-ignore lint/complexity/noBannedTypes: intentionally empty context type — add fields here when adding auth
export type Context = {};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
