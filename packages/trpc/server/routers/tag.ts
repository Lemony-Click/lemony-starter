import { tagService } from "@workspace/services";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const tagRouter = router({
	list: publicProcedure.query(() => tagService.list()),

	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1).max(50),
				color: z
					.string()
					.regex(/^#[0-9a-fA-F]{6}$/)
					.optional()
					.default("#6366f1"),
			}),
		)
		.mutation(({ input }) => tagService.create(input)),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input }) => tagService.delete(input.id)),
});
