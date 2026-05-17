import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@workspace/trpc/server";

export const trpc = createTRPCReact<AppRouter>();
