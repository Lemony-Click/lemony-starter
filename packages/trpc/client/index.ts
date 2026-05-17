import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/appRouter";

/**
 * Creates a vanilla tRPC client.
 * For React apps, use @trpc/react-query instead — see apps/web/src/lib/trpc.ts.
 */
export function createClient(serverUrl: string) {
	return createTRPCClient<AppRouter>({
		links: [httpBatchLink({ url: serverUrl })],
	});
}

export type { AppRouter };
