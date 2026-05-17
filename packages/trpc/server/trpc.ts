import { initTRPC } from "@trpc/server";

/**
 * Context is empty for the starter. Add authentication state here when needed,
 * e.g. `session: Session | null`.
 */
export interface Context {}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
