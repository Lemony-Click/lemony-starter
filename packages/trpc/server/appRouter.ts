import { router } from "./trpc";
import { noteRouter } from "./routers/note";
import { tagRouter } from "./routers/tag";

export const appRouter = router({
	note: noteRouter,
	tag: tagRouter,
});

export type AppRouter = typeof appRouter;
export type { Context } from "./trpc";
export { logger, serializeError } from "./logger";
export type { NoteStatus } from "@workspace/db";
