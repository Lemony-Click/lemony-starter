import { noteRouter } from "./routers/note";
import { tagRouter } from "./routers/tag";
import { router } from "./trpc";

export const appRouter = router({
	note: noteRouter,
	tag: tagRouter,
});

export type AppRouter = typeof appRouter;
export type { NoteStatus } from "@workspace/db";
export { logger, serializeError } from "./logger";
export type { Context } from "./trpc";
