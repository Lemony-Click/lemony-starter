import type { NoteStatus } from "@workspace/db";
import { prisma } from "@workspace/db";

export interface CreateNoteInput {
	title: string;
	content?: string;
	status?: NoteStatus;
	tagIds?: string[];
}

export interface UpdateNoteInput {
	title?: string;
	content?: string;
	status?: NoteStatus;
	tagIds?: string[];
}

/** Full note shape returned by every service method */
const noteInclude = {
	tags: { include: { tag: true } },
} as const;

export const noteService = {
	async list(status?: NoteStatus) {
		return prisma.note.findMany({
			where: status ? { status } : undefined,
			include: noteInclude,
			orderBy: { createdAt: "desc" },
		});
	},

	async get(id: string) {
		return prisma.note.findUniqueOrThrow({
			where: { id },
			include: noteInclude,
		});
	},

	async create(input: CreateNoteInput) {
		const { tagIds = [], ...data } = input;
		return prisma.note.create({
			data: {
				...data,
				tags: { create: tagIds.map((tagId) => ({ tagId })) },
			},
			include: noteInclude,
		});
	},

	async update(id: string, input: UpdateNoteInput) {
		const { tagIds, ...data } = input;

		// Replace all tag associations when tagIds is provided
		if (tagIds !== undefined) {
			await prisma.noteTag.deleteMany({ where: { noteId: id } });
			if (tagIds.length > 0) {
				await prisma.noteTag.createMany({
					data: tagIds.map((tagId) => ({ noteId: id, tagId })),
				});
			}
		}

		return prisma.note.update({
			where: { id },
			data,
			include: noteInclude,
		});
	},

	async delete(id: string) {
		return prisma.note.delete({ where: { id } });
	},
};
