import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { noteService } from "@workspace/services";

const noteStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const noteRouter = router({
	list: publicProcedure
		.input(z.object({ status: noteStatusSchema.optional() }))
		.query(({ input }) => noteService.list(input.status)),

	get: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(({ input }) => noteService.get(input.id)),

	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1).max(200),
				content: z.string().optional().default(""),
				status: noteStatusSchema.optional(),
				tagIds: z.array(z.string()).optional().default([]),
			})
		)
		.mutation(({ input }) => noteService.create(input)),

	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).max(200).optional(),
				content: z.string().optional(),
				status: noteStatusSchema.optional(),
				tagIds: z.array(z.string()).optional(),
			})
		)
		.mutation(({ input }) => {
			const { id, ...data } = input;
			return noteService.update(id, data);
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input }) => noteService.delete(input.id)),
});
